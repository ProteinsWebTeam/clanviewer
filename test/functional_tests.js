
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

    it('shold show an svg',function(done) {
        client
            .url('http://localhost:9090/examples/simple')
            .getHTML('.clanviewer', function(err, html) {
                console.log(html);
                assert.include(html, "svg");
            })
            .call(done);
    });

    after(function(done) {
        client.end(done);
    });
});