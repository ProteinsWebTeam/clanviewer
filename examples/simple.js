// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("clanviewer");
var instance = new app({el: rootDiv, directional: true});
d3.json("example2.json", function(error, data) {
    instance.paint(data);
});
