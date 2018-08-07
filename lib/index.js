"use strict";
/*
 * clanviewer
 * https://github.com/4ndr01d3/clanviewer
 *
 * Copyright (c) 2015 gsalazar
 * Licensed under the Apache-2.0 license.
 */

/**
 @class clanviewer
 A component to visualise the relationships between the Pfam families in a clan
 */
import {select, event as d3Event} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {zoom as d3Zoom} from 'd3-zoom';
import {drag as d3Drag} from 'd3-drag';
import {forceSimulation, forceCenter, forceManyBody, forceLink} from 'd3-force';
import ResizeObserver from 'resize-observer-polyfill';

export default class ClanViewer {
    constructor({
        element="body",
        directional=false,
        width=undefined,
        height=undefined,
        r=5,
        multiple_relationships=false,
    }){
        this.r = r;
        this._autoWidth=!width;
        this._autoHeight=!height;
        this.width = width;
        this.height = height;
        this.element = element;
        this.multiple_relationships = multiple_relationships;
        this.directional = directional;

        this.size = scaleLinear()
            .range([1, 5 * this.r]);

        this.tickness = scaleLinear()
            .range([0.5, 1, 5])
            .domain([1, 1e-4, 0]);

        this.force = forceSimulation()
            .force("charge", forceManyBody()
                .strength(-100)
            )
            .force("link", forceLink()
                .id(d => d.accession)
                .distance(200)
            )
            .force("center", forceCenter(width / 2, height / 2));

        this.zoom = d3Zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", () => {
                this.maingroup.attr("transform",d3Event.transform);
            });

        this.drag = d3Drag()
            .on("start",  d => {
                d3Event.sourceEvent.stopPropagation();
                this.force.alphaTarget(0.1).restart();
                d.fx = d.x;
                d.fy = d.y;

            })
            .on("drag",  d => {
                d.fx = d3Event.x;
                d.fy = d3Event.y;
            })
            .on("end",  () => {
                d3Event.sourceEvent.stopPropagation();
                if (!d3Event.active) this.force.alphaTarget(0);
            });

        this.svg = select(this.element).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("class", "clanviewer")
            .attr("pointer-events", "all")
            .call(this.zoom).on("dblclick.zoom", null);

        this.maingroup = this.svg
            .append("g");

        if(this._autoWidth) {
            this.svg.style('display', 'block');
            this.svg.attr('width', '100%');
        }
        if(this._autoHeight) {
            this.svg.style('display', 'block');
            this.svg.attr('height', '100%');
        }
        if (this._autoHeight || this._autoWidth) {
            this._autoUpdateSize();
            this._ro = new ResizeObserver(this._autoUpdateSize.bind(this));
            this._ro.observe(this.svg.node());
        }
        this.paint.bind(this)
    }

    _autoUpdateSize() {
        this.width = parseInt(this.svg.style('width'), 10);
        this.height = parseInt(this.svg.style('height'), 10);
        this.force.force("center", forceCenter(this.width / 2, this.height / 2));
        if (this.tick) {
            this.force.alpha(this.force.alpha()+0.1);
            this.force.restart();
        }
    }

    /**
     * The 'paint' method receives a json object and generates a force-directed layout that maps the memebers with ith relationships
     * @param data an object structure based on a json file similar to:
     * {
     *     "clan_acc":"CL0050",
     *     "clan_id":"HotDog",
     *     "members":[
     *       { "pfama_acc":"PF03061", "link":"http://pfam.xfam.org/family/PF03061", "pfama_id":"4HBT", "num_full":88944 },
     *       { "pfama_acc":"PF01643", "link":"http://pfam.xfam.org/family/PF01643", "pfama_id":"Acyl-ACP_TE", "num_full":7178 },
     *     ],
     *     "relationships":[
     *       { "pfama_acc_1":"4HBT", "pfama_acc_2":"Acyl-ACP_TE", "evalue":8.2e-6 }
     *     ]
     * }
     * * @param is_data_processed Boolean indicating if the data is already in the format:
     * {
     *   "nodes": [
     *      {accession: "PF03761", id: "DUF316", score: 189},
     *      {accession: "PF03761", id: "DUF316", score: 189},
     *   ],
     *   "links": [
     *      {source: 0, target: 1, evalue: 0.000016}
     *   ],
     * }
     *
     */
    paint(data, is_data_processed=false) {
        if (!is_data_processed) this.processData(data);

        this.force
            .nodes(data.nodes)
            .force("link").links(data.links);

        if (this.directional)
            this.maingroup.append("defs").append("marker")
                .attr("id", "arrowhead")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 11)
                .attr("refY", 0)
                .attr("markerWidth", 2)
                .attr("markerHeight", 2)
                .attr("orient", "auto")
                .append("path")
                    .attr("d", "M0,-5L10,0L0,5");

        const linkG = this.maingroup.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(data.links)
            .enter().append("g")
                .attr("class", d => `link ${d.source.accession} ${d.target.accession}` );

        const link = linkG.append("path")
            .style("stroke-width", d => this.tickness(d.score))
            .attr("marker-end",this.directional?"url(#arrowhead)":null);

        const label_link_link = linkG.filter(d => d.link)
            .append("a")
                .attr("xlink:href", d => d["link"]?d["link"]:null)
                .attr("target", "_blank")
                .attr("class", d => d["link"]?"href":null)
                .append("text")
                    .text(d => d.score.toExponential());

        const label_link_text = linkG.filter(d => !d.link)
            .append("text")
                .text(d => d.score.toExponential());

        const nodeG = this.maingroup.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(data.nodes)
            .enter().append("g")
                .attr("id", d => `node_${d.accession}`)
                .attr("data-accession", d => d.accession)
                .attr("class", "node");

        const node = nodeG.append("circle")
            .attr("r", d => this.size(d.score))
            .call(this.drag)
            .on("dblclick", function (d){
                d.fx = null;
                d.fy = null;
            });

        const label_node_link = nodeG.filter(d => d.link)
            .append("a")
                .attr("xlink:href", d => d["link"]?d["link"]:null)
                .attr("target", "_blank")
                .attr("class", d => d["link"]?"href":null)
                .append("text")
                    .text(d => d.accession);
        const label_node_text = nodeG.filter(d => !d.link)
            .append("text")
                .text(d => d.accession);

        this.tick = () => {
            link.attr("d", ClanViewer.linkArc);

            label_link_link
                .attr("transform", ClanViewer.labelArc);
            label_link_text
                .attr("transform", ClanViewer.labelArc);

            node.attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label_node_link
                .attr("x", d => d.x+this.size(d.score)+2)
                .attr("y", d => d.y+this.r);
            label_node_text
                .attr("x", d => d.x+this.size(d.score)+2)
                .attr("y", d => d.y+this.r);
        };
        this.force.on("tick", this.tick);

    }

    static linkArc(d) {
        const dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        d.dr = dr;
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }
    static labelArc(d){
        const x   = (d.target.x + d.source.x)/2;
        const y   = (d.target.y + d.source.y)/ 2; // (x,y) is the point in the middle of target and source
        const h   = d.dr;
        const A   = h/ 2;
        const B   = h - Math.sqrt(h * h - A * A);
        const mB  = (d.source.x - x)/(y - d.source.y); //TODO: check division by 0
        const div = Math.sqrt(1+mB*mB);
        const px  = (d.target.y>d.source.y)?x + B*(1/div):x - B*(1/div);
        const py  = (d.target.y>d.source.y)?y + B*(mB/div):y - B*(mB/div);
        return "translate(" + px + "," + py + ")";
    }
    processData(data) {
        let max = this.r;
        data.members = data.members || data.nodes;
        data.relationships = data.relationships || data.links;
        data.nodes = data.members.map(e => ({
            accession: e.accession || e.pfama_acc,
            name: e.name || e.pfama_id,
            score: Number.parseFloat(e.score || e.num_full),
        }));
        data.nodes.forEach( e => {
            max = Math.max(max, e.score);
        });
        if (this.multiple_relationships) {
            data.relationships.forEach(e => {
                e.source = e.source || e.pfama_acc_1;
                e.target = e.target || e.pfama_acc_2;
                e.score = Number.parseFloat(e.score || e.evalue);
            });
            data.links = data.relationships;
        } else {
            const tmp_relationships = {};
            data.relationships.forEach(e => {
                const acc1 = e.source || e.pfama_acc_1;
                const acc2 = e.target || e.pfama_acc_2;
                const score = Number.parseFloat(e.score || e.evalue);
                let key = `${acc1}_${acc2}`;
                if (key in tmp_relationships) {
                    tmp_relationships[key].score = Math.max(tmp_relationships[key].score, score);
                } else if (`${acc2}_${acc1}` in tmp_relationships) {
                    key = `${acc2}_${acc1}`;
                    // tmp_relationships[key].evalue =tmp_relationships[key].evalue> e.evalue? e.evalue:tmp_relationships[key].evalue;
                    tmp_relationships[key].score = Math.max(tmp_relationships[key].score, score);
                } else {
                    tmp_relationships [key] = {
                        source: acc1,
                        target: acc2,
                        score: score
                    };
                }
            });
            data.links = Object.keys(tmp_relationships).map(key => tmp_relationships[key]);
        }
        this.size.domain([0, max]);
    }
}
