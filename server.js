var express = require("express");
app = express();

var thorio = require("./src/thor-io.js").ThorIO;

var chat = require("./exampleControllers/Chat.Controller.js")



var controllers = [
    chat.ChatController,
    thorio.Controllers.BrokerController
];

var thorIO = new thorio.Engine(controllers);

var expressWs = require("express-ws")(app);

app.use("/test", express.static("test"));
app.use("/client", express.static("test")); // make sure old links work.

app.use("/src/", express.static("src"));

app.ws("/", function (ws, req) {
    thorIO.addConnection(ws);
});

var port = process.env.PORT || 1337;;
app.listen(port);