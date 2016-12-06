"use strict";
var thor_io_1 = require("./src/thor-io");
// import {ChatController} from "./exampleControllers/Chat.Controller"
var Todo_Controller_1 = require("./test/todo-app/controllers/Todo.Controller");
var testControllers = require("./exampleControllers/Chat.Controller.js");
var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
// Set up fake storage, just a static 'class' ...
new Todo_Controller_1.TodoApp.Realtime.Todos();
var controllers = [
    testControllers.ChatController,
    testControllers.FooController,
    thor_io_1.ThorIO.Controllers.BrokerController,
    Todo_Controller_1.TodoApp.Realtime.TodoController
];
var thorIO = new thor_io_1.ThorIO.Engine(controllers);
// thorIO.addEndpoint(ThorIO.PipeMessageTransport,"127.0.0.1",4502) 
// thorIO.addEndpoint(ThorIO.BufferMessageTransport,"127.0.0.1",4503);
app.use("/test", express.static("test"));
app.use("/client", express.static("test"));
app.use("/src/", express.static("src"));
app.ws("/", function (ws, req) {
    thorIO.addWebSocket(ws, req);
});
app.listen(process.env.PORT || 1337);
/// add an extra endpoint that allows the SimpleTransport (protocol)
//# sourceMappingURL=server.js.map