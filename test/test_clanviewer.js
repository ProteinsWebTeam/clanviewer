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
var clanviewer = require('../');

describe('clanviewer module', function(){
    describe('#labelArc()', function(){
        it('should return the translate coordinates', function(){
            var data = {
                "target":{"x":8, "y":2},
                "source":{"x":3, "y":6}
            };
            var arc = clanviewer.linkArc(data);

            arc.should.include("M3,6");
            arc.should.include("A6.4");
            arc.should.include(",6.40");

            var label = clanviewer.labelArc(data);
            console.log(label);
            label.should.include("translate(");
        });
    });
});
