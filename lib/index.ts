"use strict";
/*
 * clanviewer
 * https://github.com/ProteinsWebTeam/clanviewer
 *
 * Copyright (c) 2022 gustavo-salazar
 * Licensed under the Apache-2.0 license.
 */

/**
 @class clanviewer
 A component to visualise the relationships between the Pfam families in a clan
 */
import { select, Selection } from "d3-selection";
import { ScaleLinear, scaleLinear } from "d3-scale";
import { zoom as d3Zoom, ZoomBehavior } from "d3-zoom";
import { drag as d3Drag, DragBehavior } from "d3-drag";
import {
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceLink,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
  ForceLink,
} from "d3-force";

import "../css/clanviewer.css";

interface ClanSimulationNode extends SimulationNodeDatum {
  accession: string;
}
type PfamMember = {
  pfama_acc: string;
  pfama_id: string;
  num_full: number | string;
  accession?: string;
  link?: string;
};
type PfamRelationship = {
  pfama_acc_1: string;
  pfama_acc_2: string;
  evalue: number;
};
type ClanNode = {
  accession: string;
  id?: string;
  name?: string;
  score: number;
  x?: number;
  y?: number;
  link?: string;
};
type ClanLink = {
  source: number | string | ClanSimulationNode;
  target: number | string | ClanSimulationNode;
  score: number;
  link?: string;
  radius?: number;
};
type ClanProcessedData = {
  nodes: Array<ClanNode>;
  links: Array<ClanLink>;
};

type PfamData = {
  clan_acc: string;
  clan_id: string;
  total_occurrences?: number;
  members?: Array<PfamMember>;
  relationships?: Array<PfamRelationship>;
};
type ClanData = PfamData | ClanProcessedData;

export default class ClanViewer {
  r: number;
  _autoWidth: boolean;
  _autoHeight: boolean;
  width?: number;
  height?: number;
  element: string | Element;
  multiple_relationships: boolean;
  directional: boolean;
  useCtrlToZoom: boolean;
  size: ScaleLinear<number, number, never>;
  tickness: ScaleLinear<number, number, never>;
  force: Simulation<
    ClanSimulationNode,
    SimulationLinkDatum<ClanSimulationNode>
  >;
  zoom: ZoomBehavior<SVGSVGElement, unknown>;
  drag: DragBehavior<SVGCircleElement, ClanNode, unknown>;
  svg: Selection<SVGSVGElement, unknown, null, undefined>;
  maingroup: Selection<SVGGElement, unknown, null, undefined>;
  linksgroup: Selection<SVGGElement, unknown, null, undefined>;
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>;
  _ro?: ResizeObserver;
  tick?: () => void;

  constructor({
    element = "body",
    directional = false,
    width = undefined,
    height = undefined,
    r = 5,
    multiple_relationships = false,
    useCtrlToZoom = false,
  }: {
    element: string | HTMLElement;
    directional?: boolean;
    width?: number;
    height?: number;
    r?: number;
    multiple_relationships?: boolean;
    useCtrlToZoom?: boolean;
  }) {
    this.r = r;
    this._autoWidth = !width;
    this._autoHeight = !height;
    this.width = width;
    this.height = height;
    this.element = element;
    this.multiple_relationships = multiple_relationships;
    this.directional = directional;
    this.useCtrlToZoom = useCtrlToZoom;

    this.size = scaleLinear().range([1, 5 * this.r]);

    this.tickness = scaleLinear().range([0.5, 1, 5]).domain([1, 1e-4, 0]);

    this.svg = select(this.element as Element)
      .append("svg")
      .attr("width", this.width || 0)
      .attr("height", this.height || 0)
      .attr("class", "clanviewer")
      .attr("pointer-events", "all");
    this.maingroup = this.svg.append("g");
    this.linksgroup = this.maingroup.append("g").attr("class", "links");
    this.nodeGroup = this.maingroup.append("g").attr("class", "nodes");

    this.force = forceSimulation<ClanSimulationNode>()
      .force("charge", forceManyBody().strength(-100))
      .force(
        "link",
        forceLink()
          .id((d) => (d as ClanSimulationNode).accession)
          .distance(200)
      )
      .force("center", forceCenter(width || 0 / 2, height || 0 / 2));

    this.zoom = d3Zoom<SVGSVGElement, unknown>()
      .filter((event) => {
        if (!(event instanceof WheelEvent)) return true;
        return !this.useCtrlToZoom || event.ctrlKey;
      })
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        this.maingroup.attr("transform", event.transform);
      });

    this.drag = d3Drag<SVGCircleElement, ClanNode>()
      .on("start", (event, node) => {
        const d = node as ClanSimulationNode;
        event.sourceEvent.stopPropagation();
        this.force.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, node) => {
        const d = node as ClanSimulationNode;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event) => {
        event.sourceEvent.stopPropagation();
        if (!event.active) this.force.alphaTarget(0);
      });

    this.svg.call(this.zoom).on("dblclick.zoom", null);

    if (this.directional)
      this.maingroup
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 11)
        .attr("refY", 0)
        .attr("markerWidth", 2)
        .attr("markerHeight", 2)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    if (this._autoWidth) {
      this.svg.style("display", "block");
      this.svg.attr("width", "100%");
    }
    if (this._autoHeight) {
      this.svg.style("display", "block");
      this.svg.attr("height", "100%");
    }
    if (this._autoHeight || this._autoWidth) {
      this._autoUpdateSize();
      this._ro = new ResizeObserver(this._autoUpdateSize.bind(this));
      if (this.svg.node()) this._ro.observe(this.svg.node() as Element);
    }
    this.paint.bind(this);
    this.tick = undefined;
  }

  _autoUpdateSize() {
    const parent = select(this.element as Element);
    this.width = parseInt(parent.style("width"), 10) || 0;
    this.height = parseInt(parent.style("height"), 10) || 0;
    this.force.force("center", forceCenter(this.width / 2, this.height / 2));
    this.svg.attr("viewBox", `0 0 ${this.width} ${this.height}`);
    if (this.tick) {
      this.force.restart();
    }
  }

  paint(data: ClanData) {
    const processedData = this.processData(data);

    this.force?.nodes(processedData.nodes || []);
    (
      this.force.force("link") as ForceLink<
        SimulationNodeDatum,
        SimulationLinkDatum<ClanSimulationNode>
      >
    ).links(processedData.links);

    const linkGData = this.linksgroup
      .selectAll(".link")
      .data(processedData.links);

    const linkG = linkGData
      .enter()
      .append("g")
      .attr(
        "class",
        (d) =>
          `link ${(d.source as ClanNode).accession} ${
            (d.target as ClanNode).accession
          }`
      );
    linkGData.exit().remove();

    const link = linkG
      .append("path")
      .style("stroke-width", (d) => this.tickness(d.score))
      .attr("marker-end", this.directional ? "url(#arrowhead)" : null);

    const label_link_link = linkG
      .filter((d) => !!d.link)
      .append("a")
      .attr("xlink:href", (d) => (d["link"] ? d["link"] : null))
      .attr("target", "_blank")
      .attr("class", (d) => (d["link"] ? "href" : null))
      .append("text")
      .text((d) => d.score.toExponential());

    const label_link_text = linkG
      .filter((d) => !d.link)
      .append("text")
      .text((d) => d.score.toExponential());

    const nodeGdata = this.nodeGroup
      .selectAll(".node")
      .data(processedData.nodes);
    const nodeG = nodeGdata
      .enter()
      .append("g")
      .attr("id", (d) => `node_${d.accession}`)
      .attr("data-accession", (d) => d.accession)
      .attr("class", "node");
    nodeGdata.exit().remove();
    const node = nodeG
      .append("circle")
      .attr("r", (d) => this.size(d.score))
      .call(this.drag)
      .on("dblclick", function (d) {
        d.fx = null;
        d.fy = null;
      });

    const label_node_link = nodeG
      .filter((d) => !!d.link)
      .append("a")
      .attr("xlink:href", (d) => (d["link"] ? d["link"] : null))
      .attr("target", "_blank")
      .attr("class", (d) => (d["link"] ? "href" : null))
      .append("text")
      .text((d) => d.accession);
    const label_node_text = nodeG
      .filter((d) => !d.link)
      .append("text")
      .text((d) => d.accession);

    this.tick = () => {
      link.attr("d", ClanViewer.linkArc);

      label_link_link.attr("transform", ClanViewer.labelArc);
      label_link_text.attr("transform", ClanViewer.labelArc);

      node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);

      label_node_link
        .attr("x", (d) => (d.x || 0) + this.size(d.score) + 2)
        .attr("y", (d) => (d.y || 0) + this.r);
      label_node_text
        .attr("x", (d) => (d.x || 0) + this.size(d.score) + 2)
        .attr("y", (d) => (d.y || 0) + this.r);
    };
    this.force.on("tick", this.tick);
    this.force.alpha(1);
  }

  clear() {
    this.paint({
      nodes: [],
      links: [],
    });
  }

  static linkArc(d: ClanLink) {
    const tx = (d.target as ClanSimulationNode)?.x || 0;
    const ty = (d.target as ClanSimulationNode)?.y || 0;
    const sx = (d.source as ClanSimulationNode)?.x || 0;
    const sy = (d.source as ClanSimulationNode)?.y || 0;
    const dx = tx - sx,
      dy = ty - sy,
      dr = Math.sqrt(dx * dx + dy * dy);
    d.radius = dr;
    return (
      "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty
    );
  }
  static labelArc(d: ClanLink) {
    const tx = (d.target as ClanSimulationNode)?.x || 0;
    const ty = (d.target as ClanSimulationNode)?.y || 0;
    const sx = (d.source as ClanSimulationNode)?.x || 0;
    const sy = (d.source as ClanSimulationNode)?.y || 0;
    const x = (tx + sx) / 2;
    const y = (ty + sy) / 2; // (x,y) is the point in the middle of target and source
    const h = d.radius || 0;
    const A = h / 2;
    const B = h - Math.sqrt(h * h - A * A);
    const mB = (sx - x) / (y - sy); //TODO: check division by 0
    const div = Math.sqrt(1 + mB * mB);
    const px = ty > sy ? x + B * (1 / div) : x - B * (1 / div);
    const py = ty > sy ? y + B * (mB / div) : y - B * (mB / div);
    return "translate(" + px + "," + py + ")";
  }
  processData(data: ClanData): ClanProcessedData {
    const newData: ClanProcessedData = {
      nodes: [],
      links: [],
    };
    const members =
      (data as PfamData).members || (data as ClanProcessedData).nodes || [];
    const relationships =
      (data as PfamData).relationships ||
      (data as ClanProcessedData).links ||
      [];
    newData.nodes = members.map(
      (e) =>
        ({
          id: (e as ClanNode).accession || (e as PfamMember).pfama_acc,
          accession: (e as ClanNode).accession || (e as PfamMember).pfama_acc,
          name: (e as ClanNode).name || (e as PfamMember).pfama_id,
          score: Number.parseFloat(
            String((e as ClanNode).score ?? (e as PfamMember).num_full)
          ),
        } || [])
    );

    let max = 0;
    newData.nodes.forEach((e) => {
      max = Math.max(max, e.score);
    });

    if (this.multiple_relationships) {
      newData.links = relationships.map((e) => ({
        source: (e as ClanLink).source || (e as PfamRelationship).pfama_acc_1,
        target: (e as ClanLink).target || (e as PfamRelationship).pfama_acc_2,
        score: Number.parseFloat(
          String((e as ClanLink).score || (e as PfamRelationship).evalue)
        ),
      }));
    } else {
      const tmp_relationships: {
        [key: string]: ClanLink;
      } = {};
      relationships.forEach((e) => {
        const acc1 =
          (e as ClanLink).source || (e as PfamRelationship).pfama_acc_1;
        const acc2 =
          (e as ClanLink).target || (e as PfamRelationship).pfama_acc_2;
        const score = Number.parseFloat(
          String((e as ClanLink).score || (e as PfamRelationship).evalue)
        );
        let key = `${acc1}_${acc2}`;
        if (key in tmp_relationships) {
          tmp_relationships[key].score = Math.max(
            tmp_relationships[key].score,
            score
          );
        } else if (`${acc2}_${acc1}` in tmp_relationships) {
          key = `${acc2}_${acc1}`;
          tmp_relationships[key].score = Math.max(
            tmp_relationships[key].score,
            score
          );
        } else {
          tmp_relationships[key] = {
            source: acc1,
            target: acc2,
            score: score,
          };
        }
      });
      newData.links = Object.keys(tmp_relationships).map(
        (key) => tmp_relationships[key]
      );
    }
    this.size.domain([0, max]);
    return newData;
  }
}
