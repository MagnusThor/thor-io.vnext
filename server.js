var express = require("express");
app = express();

var thorio = require("./src/thor-io.js").ThorIO;

var chat = require("./exampleControllers/Chat.Controller.js")

var todoSample = require("./test/todo-app/controllers/Todo.Controller.js")


// Set up fake storage
new todoSample.TodoApp.Realtime.Todos();




var controllers = [
    chat.ChatController,
    thorio.Controllers.BrokerController,
    todoSample.TodoApp.Realtime.TodoController
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