// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("clanviewer");
var instance = new app({el: rootDiv});
d3.json("example.json", function(error, data) {
    console.log(instance);
    instance.paint(data);
});
