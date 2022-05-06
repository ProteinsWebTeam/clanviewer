/**
 @class clanviewer
 A component to visualise the relationships between the Pfam families in a clan
 */
import { Selection } from "d3-selection";
import { ScaleLinear } from "d3-scale";
import { ZoomBehavior } from "d3-zoom";
import { DragBehavior } from "d3-drag";
import { Simulation, SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import "../css/clanviewer.css";
interface ClanSimulationNode extends SimulationNodeDatum {
    accession: string;
}
declare type PfamMember = {
    pfama_acc: string;
    pfama_id: string;
    num_full: number | string;
    accession?: string;
    link?: string;
};
declare type PfamRelationship = {
    pfama_acc_1: string;
    pfama_acc_2: string;
    evalue: number;
};
declare type ClanNode = {
    accession: string;
    id?: string;
    name?: string;
    score: number;
    x?: number;
    y?: number;
    link?: string;
    short_name?: string;
    type?: string;
};
declare type ClanLink = {
    source: number | string | ClanSimulationNode;
    target: number | string | ClanSimulationNode;
    score: number;
    link?: string;
    radius?: number;
};
declare type ClanProcessedData = {
    nodes: Array<ClanNode>;
    links: Array<ClanLink>;
};
declare type PfamData = {
    clan_acc: string;
    clan_id: string;
    total_occurrences?: number;
    members?: Array<PfamMember>;
    relationships?: Array<PfamRelationship>;
};
declare type ClanData = PfamData | ClanProcessedData;
declare type NodeLabel = "name" | "short_name" | "accession" | ((n: ClanNode) => string);
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
    force: Simulation<ClanSimulationNode, SimulationLinkDatum<ClanSimulationNode>>;
    zoom: ZoomBehavior<SVGSVGElement, unknown>;
    drag: DragBehavior<SVGCircleElement, ClanNode, unknown>;
    svg: Selection<SVGSVGElement, unknown, null, undefined>;
    maingroup: Selection<SVGGElement, unknown, null, undefined>;
    linksgroup: Selection<SVGGElement, unknown, null, undefined>;
    nodeGroup: Selection<SVGGElement, unknown, null, undefined>;
    _ro?: ResizeObserver;
    tick?: () => void;
    nodeLabel?: NodeLabel;
    updatingLabels: boolean;
    constructor({ element, directional, width, height, r, multiple_relationships, useCtrlToZoom, nodeLabel, }: {
        element: string | HTMLElement;
        directional?: boolean;
        width?: number;
        height?: number;
        r?: number;
        multiple_relationships?: boolean;
        useCtrlToZoom?: boolean;
        nodeLabel?: NodeLabel;
    });
    _autoUpdateSize(): void;
    private getLabel;
    paint(data: ClanData): void;
    clear(): void;
    static linkArc(d: ClanLink): string;
    static labelArc(d: ClanLink): string;
    updateNodeLabel(nodeLabel?: NodeLabel): void;
    processData(data: ClanData): ClanProcessedData;
}
export {};
