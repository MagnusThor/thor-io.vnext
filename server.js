"use strict";
var thor_io_1 = require("./src/thor-io");
var Chat_Controller_1 = require("./exampleControllers/Chat.Controller");
var Todo_Controller_1 = require("./test/todo-app/controllers/Todo.Controller");
var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
// Set up fake storage, just a static 'class' ...
new Todo_Controller_1.TodoApp.Realtime.Todos();
var thorIO = new thor_io_1.ThorIO.Engine([
    Chat_Controller_1.ChatController,
    thor_io_1.ThorIO.Controllers.BrokerController,
    Todo_Controller_1.TodoApp.Realtime.TodoController
]);
thorIO.addEndpoint(thor_io_1.ThorIO.SimpleTransport, "127.0.0.1", 4502);
app.use("/test", express.static("test"));
app.use("/client", express.static("test"));
app.use("/src/", express.static("src"));
app.ws("/", function (ws, req) {
    thorIO.addWebSocket(ws, req);
});
app.listen(process.env.PORT || 1337);
/// add an extra endpoint that allows the SimpleTransport (protocol)
//# sourceMappingURL=server.js.map