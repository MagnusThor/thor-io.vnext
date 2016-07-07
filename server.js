var express = require("express");
app = express();
var thorio = require("./src/thor-io.js").ThorIO;
var samples = require("./example/Sample.Controller.js")
var chat = require("./example/Chat.Controller.js")
var broker = require("./example/Broker.Controller.js")

var net = require("net");

var controllers = [{
    alias: "example",
    instance: samples.ExampleController
}, {
    alias: "chat",
    instance: chat.ChatController
},
{
    alias: "broker",
    instance: broker.BrokerController
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

// var p = new thorio.EndPoint(4502, function(connection) {
//     console.log("got a connection");
//     //console.log(connection);
//     thorIO.addConnection(connection);
// });




// var socket = new net.Socket();

// setTimeout(function() {

//     socket.on("data", (message) => {
//         var r = message;
//         console.log("client data ->", message.toString());
//     });

//     socket.connect(4502, "127.0.0.1", function(connection) {
//         socket.write("$open_|chat")
//     });
// }, 2000);