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

var dataJson = {
    "members":[
        { "accession":"f1", "id":"id1", "num_occurrences":1},
        { "accession":"f2", "id":"id2", "num_occurrences":2}
    ],
    "interactions":[
        { "member_id_1":"id1", "member_id_2":"id2", "e_value":8.2e-6 }
    ]
};

describe('clanviewer module', function(){
    describe('constructor()', function(){
        it('should initialise the options', function(){
            var options = {
                "el":document.createElement('div'),
                "width":450,
                "height":250,
                "r":10
            };
            var obj = new clanviewer(options);

            obj.element.should.equal(options.el);
            obj.width.should.equal(options.width);
            obj.height.should.equal(options.height);
            obj.r.should.equal(options.r);
            console.log("here");
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
        it('should create source and target objects in each element of data interactions', function(){
            // processData uses some values that should be initiated in the constructor, but given that we are calling
            // it in a static way, we set up those values here:
            clanviewer.r=5;
            clanviewer.size = d3.scale.linear();
            //Calling the function
            clanviewer.processData(dataJson);

            dataJson.interactions[0].source.should.equal(0);
            dataJson.interactions[0].target.should.equal(1);
        });
    });
    describe('paint()', function(){
        it('should initialise the options', function(){
            var root =document.createElement('div'),
                options = {
                    "el": root
                };
            var obj = new clanviewer(options);

            obj.paint(dataJson);

            obj.force.nodes().should.equal(dataJson.members);
            obj.force.links().should.equal(dataJson.interactions);
            dataJson.interactions.length.should.equal(d3.select(root).selectAll(".link")[0].length);
            dataJson.members.length.should.equal(d3.select(root).selectAll(".node")[0].length);
        });
    });
});
