"use strict";
const thor_io_1 = require("./src/thor-io");
const Todo_Controller_1 = require("./example/todo-app/controllers/Todo.Controller");
const testControllers = require("./exampleControllers/Example.Controllers.js");
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
// Set up fake storage, just a static 'class' ...
new Todo_Controller_1.TodoApp.Realtime.Todos();
const controllers = [
    testControllers.ChatController,
    testControllers.FooController,
    thor_io_1.ThorIO.Controllers.BrokerController,
    testControllers.MicroServiceController,
    Todo_Controller_1.TodoApp.Realtime.TodoController
];
const thorIO = new thor_io_1.ThorIO.Engine(controllers);
//thorIO.addEndpoint(ThorIO.PipeMessageTransport,"127.0.0.1",4502) 
thorIO.addEndpoint(thor_io_1.ThorIO.BufferMessageTransport, "127.0.0.1", 4503);
app.use("/test", express.static("example"));
app.use("/client", express.static("example"));
app.use("/src/", express.static("src"));
app.ws("/", function (ws, req) {
    thorIO.addWebSocket(ws, req); // add the connection (WebSocket) to the engine
});
app.listen(process.env.PORT || 1337);
//# sourceMappingURL=server.js.map