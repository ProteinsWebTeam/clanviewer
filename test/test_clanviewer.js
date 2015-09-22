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
  describe('#hello()', function(){
    it('should return a hello', function(){

      assert.include(clanviewer.hello('biojs'), ("hello"));
      assert.include(clanviewer.hello('biojs'), ("biojs"));

      // alternative styles
      clanviewer.hello('biojs').should.include("hello");
    });
  });
});
