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
    self.width = opts.width?opts.width:900;
    self.height = opts.height?opts.height:500;
    self.r = opts.r?opts.r:5;

    self.force = d3.layout.force()
        .charge(-120)
        .linkDistance(100)
        .size([self.width, self.height]);

    self.svg = d3.select("body").append("svg")
        .attr("width", self.width)
        .attr("height", self.height);

    self.paint = function (data) {
        self.processData(data);

        self.force
            .nodes(data.members)
            .links(data.interactions)
            .start();

        var link = self.svg.selectAll(".link")
            .data(data.interactions)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var nodeG = self.svg.selectAll(".node")
            .data(data.members)
            .enter().append("g")
            .attr("class", "node");

        var node = nodeG.append("circle")
            .attr("r", self.r)
            .call(self.force.drag);

        var label = nodeG.append("text")
            .text(function(d) { return d.id; });

        self.force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            label.attr("x", function(d) { return d.x+self.r+2; })
                 .attr("y", function(d) { return d.y+self.r; })
        });
    };
    self.processData = function(data){
        var nodesA={}
        data.members.forEach(function(e, i){
            nodesA[e["id"]]=i;
        });
        data.interactions.forEach(function(e, i){
            e.source = nodesA[e["member_id_1"]]
            e.target = nodesA[e["member_id_2"]]
        })
    }
};
