var express = require("express");
app = express();
var thorio = require("./src/thor-io.js").ThorIO;
var samples = require("./example/Sample.Controller.js")
var chat = require("./example/Chat.Controller.js")

var controllers = [{
    alias: "example",
    instance: samples.ExampleController
},{
    alias: "chat",
    instance: chat.ChatController
}
];

var thorIO = new thorio.Engine(controllers);

var expressWs = require("express-ws")(app);
app.use('/client', express.static('client'));

app.ws("/", function(ws, req) {
    thorIO.addConnection(ws);
});

var port = process.env.PORT || 1337;;
app.listen(port);