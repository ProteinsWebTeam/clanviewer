/*
 * clanviewer
 * https://github.com/4ndr01d3/clanviewer
 *
 * Copyright (c) 2015 gsalazar
 * Licensed under the Apache-2.0 license.
 */

// chai is an assertion library
var chai = require('chai');

// @see http://chaijs.com/api/assert/
var assert = chai.assert;

// register alternative styles
// @see http://chaijs.com/api/bdd/
chai.expect();
chai.should();

// requires your main app (specified in index.js)
var jsdom = require('mocha-jsdom');
window = jsdom({ QuerySelector : true });

var d3 = require("d3");
var clanviewer = require('../');


describe('clanviewer module', function(){
    describe('constructor()', function(){
        it('should initialise the options', function(){
            var options = {
                "el":document.createElement('div'),
                "width":450,
                "height":250,
                "r":10,
                "testing":true
            };
            var obj = new clanviewer(options);

            obj.element.should.equal(options.el);
            obj.width.should.equal(options.width);
            obj.height.should.equal(options.height);
            obj.r.should.equal(options.r);
        });
    });
    describe('#linkArc()', function(){
        it('should return the path for an arc', function(){
            var data = {
                "target":{"x":8, "y":2},
                "source":{"x":3, "y":6}
            };
            var arc = clanviewer.linkArc(data);

            arc.should.include("M3,6");
            arc.should.include("A6.4");
            arc.should.include(",6.40");

        });
    });
    describe('#labelArc()', function(){
        it('should return the translate coordinates', function(){
            var data = {
                "target":{"x":8, "y":2},
                "source":{"x":3, "y":6}
            };
            clanviewer.linkArc(data);

            var label = clanviewer.labelArc(data);
            label.should.include("translate");
            label.should.include("(4.96");
            label.should.include(",3.33");
        });
    });
    describe('#processData(data)', function(){
        it('should create source and target objects in each element of data relationships', function(){
            // processData uses some values that should be initiated in the constructor, but given that we are calling
            // it in a static way, we set up those values here:
            var dataJson = {
                "members":[
                    { "pfama_acc":"f1", "pfama_id":"id1", "num_occurrences":1},
                    { "pfama_acc":"f2", "pfama_id":"id2", "num_occurrences":2}
                ],
                "relationships":[
                    { "pfama_acc_1":"f1", "pfama_acc_2":"f2", "evalue":8.2e-6 }
                ]
            };
            clanviewer.r=5;
            clanviewer.size = d3.scale.linear();
            //Calling the function
            clanviewer.processData(dataJson);

            dataJson.links[0].source.should.equal(0);
            dataJson.links[0].target.should.equal(1);
        });
    });
    describe('paint()', function(){
        var dataJson = {
            "members":[
                { "pfama_acc":"f1", "pfama_id":"id1", "num_occurrences":1},
                { "pfama_acc":"f2", "pfama_id":"id2", "num_occurrences":2}
            ],
            "relationships":[
                { "pfama_acc_1":"f1", "pfama_acc_2":"f2", "evalue":8.2e-6 },
                { "pfama_acc_1":"f1", "pfama_acc_2":"f2", "evalue":8.2e-7 },
                { "pfama_acc_1":"f2", "pfama_acc_2":"f1", "evalue":8.2e-5 }
            ]
        };
        it('should paint multiple relationships', function(){
            var root =document.createElement('div'),
                options = {
                    "el": root,
                    "testing":true,
                    "multiple_relationships":true,
                    "directional":true
                };
            var obj = new clanviewer(options);

            obj.paint(dataJson);

            obj.force.nodes().should.equal(dataJson.members);
            obj.force.links().should.equal(dataJson.relationships);
            dataJson.relationships.length.should.equal(d3.select(root).selectAll(".link")[0].length);
            dataJson.members.length.should.equal(d3.select(root).selectAll(".node")[0].length);
            d3.select(root).selectAll("marker")[0].length.should.equal(1)
        });
        it('should start a single relationship representing overlapping ones', function(){
            var root =document.createElement('div'),
                options = {
                    "el": root,
                    "testing":true,
                };
            var obj = new clanviewer(options);

            obj.paint(dataJson);

            obj.force.nodes().should.equal(dataJson.members);
            obj.force.links().should.not.equal(dataJson.relationships);
            dataJson.relationships.length.should.not.equal(d3.select(root).selectAll(".link")[0].length);
            dataJson.members.length.should.equal(d3.select(root).selectAll(".node")[0].length);
            d3.select(root).selectAll("marker")[0].length.should.equal(0)
        });
    });
});
