
import {ThorIO} from "./src/thor-io";
import {TodoApp} from "./example/todo-app/controllers/Todo.Controller"

const testControllers = require("./exampleControllers/Example.Controllers.js")
const express = require("express");
const app = express();

const expressWs = require("express-ws")(app);

// Set up fake storage, just a static 'class' ...
    new TodoApp.Realtime.Todos();

const controllers = [
    testControllers.ChatController,
    testControllers.FooController,
    ThorIO.Controllers.BrokerController,
    testControllers.MicroServiceController,
    TodoApp.Realtime.TodoController
];

const thorIO = new ThorIO.Engine(controllers);

//thorIO.addEndpoint(ThorIO.PipeMessageTransport,"127.0.0.1",4502) 
thorIO.addEndpoint(ThorIO.BufferMessageTransport,"127.0.0.1",4503);

app.use("/test", express.static("example"));
app.use("/client", express.static("example")); 

app.use("/src/", express.static("src"));

app.ws("/", function (ws, req) {
  
    thorIO.addWebSocket(ws,req); // add the connection (WebSocket) to the engine
});

app.listen(process.env.PORT || 1337);


