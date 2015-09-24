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
 */
var d3 = require("d3");
var  clanviewer;
module.exports = clanviewer = function(opts){
    var self = this;
    opts = opts?opts:{};
    self.element = opts.el?opts.el:"body";
    self.width = opts.width?opts.width:900;
    self.height = opts.height?opts.height:500;
    self.r = opts.r?opts.r:5;

    self.size = d3.scale.linear()
        .range([1, 5*self.r]);

    self.tickness = d3.scale.linear()
        .range([0.5, 1, 8])
        .domain([1, 1e-4, 0]);

    self.force = d3.layout.force()
        .charge(-400)
        .linkDistance(200)
        .size([self.width, self.height]);

    self.svg = d3.select(self.element).append("svg")
        .attr("width", self.width)
        .attr("height", self.height);

    self.paint= clanviewer.paint;

};
clanviewer.paint = function (data) {
    var self =this;
    clanviewer.processData(self, data);

    self.force
        .nodes(data.members)
        .links(data.interactions)
        .start();

    var linkG = self.svg.append("g").attr("class", "links").selectAll(".link")
        .data(data.interactions)
        .enter().append("g")
        .attr("class", "link")

    var link = linkG.append("path")
        .style("stroke-width", function(d){ return self.tickness(d.e_value)});

    var label_link = linkG.append("a")
        .attr("xlink:href", function (d){return d["link"]?d["link"]:null;})
        .attr("target", "_blank")
        .attr("class", function (d){return d["link"]?"href":null;})
        .append("text")
        .text(function(d) { return d.e_value.toExponential(); });

    var nodeG = self.svg.append("g").attr("class", "nodes").selectAll(".node")
        .data(data.members)
        .enter().append("g")
        .attr("class", "node");

    var node = nodeG.append("circle")
        .attr("r", function (d){return self.size(d["num_occurrences"]);})
        .call(self.force.drag);

    var label_node = nodeG.append("a")
        .attr("xlink:href", function (d){return d["link"]?d["link"]:null;})
        .attr("target", "_blank")
        .attr("class", function (d){return d["link"]?"href":null;})
        .append("text")
            .text(function(d) { return d.id; });

    self.force.on("tick", function(){
        link.attr("d", clanviewer.linkArc);

        label_link
            .attr("transform", clanviewer.labelArc);

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label_node
            .attr("x", function(d) {return d.x+self.size(d["num_occurrences"])+2;})
            .attr("y", function(d) { return d.y+self.r; })
    });
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

clanviewer.processData = function(self, data){
    var nodesA={}
    var max = self.r;
    data.members.forEach(function(e, i){
        nodesA[e["id"]]=i;
        max = max<e["num_occurrences"]?e["num_occurrences"]:max;
    });
    data.interactions.forEach(function(e, i){
        e.source = nodesA[e["member_id_1"]]
        e.target = nodesA[e["member_id_2"]]
    });
    self.size.domain([0,max]);
};
