
var chai        = require('chai'),
    assert      = chai.assert,
    webdriverio = require('webdriverio');

describe('my webdriverio tests', function(){

    this.timeout(99999999);
    var client = {};

    before(function(done){
        client = webdriverio.remote({ desiredCapabilities: {browserName: 'firefox'} });
        client.init(done);
    });

    it('should show an svg',function(done) {
        client
            .url('http://localhost:9090/examples/simple')
            .getHTML('.clanviewer', function(err, html) {
                assert.include(html, "svg");
            })
            .call(done);
    });

    it('should correspond to the json',function(done) {
        var parsedJSON = require('../examples/example.json');

        client
            .url('http://localhost:9090/examples/simple')
            .waitForVisible('#node_'+parsedJSON.members[0].id+" text",2500)
            .elements('.link path', function(err, elements) {
                assert.equal(elements.value.length,parsedJSON.interactions.length,
                    "number of paths should correspond to the number of interactions");
            })
            .elements('.node circle', function(err, elements) {
                assert.equal(elements.value.length,parsedJSON.members.length,
                    "number of circles should correspond to the number of members");
            })
            .getText('#node_'+parsedJSON.members[0].id+" text", function(err, text) {
                assert.equal(text,parsedJSON.members[0].id,
                    "the text in the legend should be the id of the corresponding json element");
            })
            .call(done);
    });

    after(function(done) {
        client.end(done);
    });
});