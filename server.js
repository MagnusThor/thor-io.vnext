var express = require("express");
app = express();
var thorio = require("./src/thor-io.js").ThorIO;
var controllers = require("./example/Sample.Controller.js")

var controllers = [{
    alias: "example",
    instance: controllers.Generic
}];

var thorIO = new thorio.Engine(controllers);

var expressWs = require("express-ws")(app);
app.use('/client', express.static('client'));

app.ws("/", function(ws, req) {
    thorIO.addConnection(ws);
});

console.log("___",process.env.PORT || 1337);

app.listen(process.env.PORT || 443);