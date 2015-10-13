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
var d3 = require('d3');
var  clanviewer;
module.exports = clanviewer = function(opts){
    var self = this;
    opts = opts?opts:{};
    self.element = opts.el?opts.el:"body";
    self.width = opts.width?opts.width:900;
    self.height = opts.height?opts.height:500;
    self.r = opts.r?opts.r:5;
    self.multiple_relationships = opts.multiple_relationships?opts.multiple_relationships:false;
    self.directional = opts.directional?opts.directional:false;

    self.size = d3.scale.linear()
        .range([1, 5*self.r]);

    self.tickness = d3.scale.linear()
        .range([0.5, 1, 5])
        .domain([1, 1e-4, 0]);

    self.force = d3.layout.force()
        .charge(-400)
        .linkDistance(200)
        .size([self.width, self.height]);

    var zoom = function(){};
    if (!opts.testing) //TODO: The unit testing fail if d3.behavior.zoom is defined, find a better way for this!
        zoom = d3.behavior.zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(){
                self.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            });

    self.drag = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart",  function(d){
            d3.event.sourceEvent.stopPropagation();
            self.force.alpha(.01);
            d.fixed = false;
        })
        .on("drag",  function(d){
            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
            self.tick();
        })
        .on("dragend",  function(d){
            d3.event.sourceEvent.stopPropagation();
            self.tick(d3.event);
            self.force.alpha(.01);
            d.fixed = true;

        });

    self.svg = d3.select(self.element).append("svg")
        .attr("width", self.width)
        .attr("height", self.height)
        .attr("class", "clanviewer")
        .attr("pointer-events", "all")
        .call(zoom).on("dblclick.zoom", null).append("g");
;

    self.paint= clanviewer.paint;
    self.processData= clanviewer.processData;

};
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
 *
 */
clanviewer.paint = function (data) {
    var self =this;
    self.processData(data);

    self.force
        .nodes(data.members)
        .links(data.relationships)
        .start();

    if (self.directional)
        self.svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 11)
            .attr("refY", 0)
            .attr("markerWidth", 2)
            .attr("markerHeight", 2)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");

    var linkG = self.svg.append("g").attr("class", "links").selectAll(".link")
        .data(data.relationships)
        .enter().append("g")
        .attr("class", function(d){ return "link "+ d.pfama_acc_1+" "+ d.pfama_acc_2;} );

    var link = linkG.append("path")
        .style("stroke-width", function(d){ return self.tickness(d.evalue)})
        .attr("marker-end",self.directional?"url(#arrowhead)":null);

    var label_link = linkG.append("a")
        .attr("xlink:href", function (d){return d["link"]?d["link"]:null;})
        .attr("target", "_blank")
        .attr("class", function (d){return d["link"]?"href":null;})
        .append("text")
        .text(function(d) { return d.evalue.toExponential(); });

    var nodeG = self.svg.append("g").attr("class", "nodes").selectAll(".node")
        .data(data.members)
        .enter().append("g")
        .attr("id", function(d){ return "node_"+d.pfama_acc; })
        .attr("class", "node");

    var node = nodeG.append("circle")
        .attr("r", function (d){return self.size(d["num_full"]);})
        .call(self.drag)
        .on("dblclick", function (d){
            d.fixed = false;
        });

    var label_node = nodeG.append("a")
        .attr("xlink:href", function (d){return d["link"]?d["link"]:null;})
        .attr("target", "_blank")
        .attr("class", function (d){return d["link"]?"href":null;})
        .append("text")
            .text(function(d) { return d.pfama_id; });

    self.tick = function(){
        link.attr("d", clanviewer.linkArc);

        label_link
            .attr("transform", clanviewer.labelArc);

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label_node
            .attr("x", function(d) {return d.x+self.size(d["num_full"])+2;})
            .attr("y", function(d) { return d.y+self.r; })
    };
    self.force.on("tick", self.tick);
};

clanviewer.linkArc = function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    d.dr = dr;
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
};

clanviewer.labelArc = function(d) {
    var x   = (d.target.x + d.source.x)/2;
    var y   = (d.target.y + d.source.y)/ 2; // (x,y) is the point in the middle of target and source
    var h   = d.dr;
    var A   = h/ 2;
    var B   = h - Math.sqrt(h * h - A * A);
    var mB  = (d.source.x - x)/(y - d.source.y); //TODO: check division by 0
    var div = Math.sqrt(1+mB*mB);
    var px  = (d.target.y>d.source.y)?x + B*(1/div):x - B*(1/div);
    var py  = (d.target.y>d.source.y)?y + B*(mB/div):y - B*(mB/div);
    return "translate(" + px + "," + py + ")";
}

clanviewer.processData = function(data){
    var self =this;
    var nodesA={}
    var max = self.r;
    data.members.forEach(function(e, i){
        nodesA[e["pfama_acc"]]=i;
        max = max<e["num_full"]?e["num_full"]:max;
    });
    if (self.multiple_relationships) {
        data.relationships.forEach(function (e, i) {
            e.source = nodesA[e["pfama_acc_1"]]
            e.target = nodesA[e["pfama_acc_2"]]
        });
    }else{
        var tmp_relationships = {};
        data.relationships.forEach(function (e, i) {
            var key= e["pfama_acc_1"]+"_"+e["pfama_acc_2"];
            if (key in tmp_relationships){
                tmp_relationships[key].evalue =tmp_relationships[key].evalue> e.evalue? e.evalue:tmp_relationships[key].evalue;
            } else if(e["pfama_acc_2"]+"_"+e["pfama_acc_1"] in tmp_relationships){
                key = e["pfama_acc_2"]+"_"+e["pfama_acc_1"];
                tmp_relationships[key].evalue =tmp_relationships[key].evalue> e.evalue? e.evalue:tmp_relationships[key].evalue;
            } else {
                tmp_relationships [key] = {
                    source: nodesA[e["pfama_acc_1"]],
                    target: nodesA[e["pfama_acc_2"]],
                    evalue: e.evalue
                };
            }
        });
        data.relationships = Object.keys(tmp_relationships).map(function (key) {return tmp_relationships[key]});
    }
    self.size.domain([0,max]);
};
