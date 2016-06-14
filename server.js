var express = require("express");
app = express();
var rt = require("./src/thor-io.js");

var controllers = [{
    alias: "generic",
    instance: rt.Generic
}];


var thorIO = new rt.ThorIO.Engine(controllers);


var expressWs = require("express-ws")(app);

app.use('/client', express.static('client'));

app.ws("/", function(ws, req) {
    thorIO.addConnection(ws);
});


app.listen(process.env.port || 1337);