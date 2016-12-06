
import {ThorIO} from "./src/thor-io";
// import {ChatController} from "./exampleControllers/Chat.Controller"
import {TodoApp} from "./test/todo-app/controllers/Todo.Controller"
let testControllers = require("./exampleControllers/Chat.Controller.js")
let express = require("express");
let app = express();
let expressWs = require("express-ws")(app);
// Set up fake storage, just a static 'class' ...
new TodoApp.Realtime.Todos();

let controllers = [
    testControllers.ChatController,
    testControllers.FooController,
    ThorIO.Controllers.BrokerController,
    TodoApp.Realtime.TodoController
];

let thorIO = new ThorIO.Engine(controllers);

// thorIO.addEndpoint(ThorIO.PipeMessageTransport,"127.0.0.1",4502) 
// thorIO.addEndpoint(ThorIO.BufferMessageTransport,"127.0.0.1",4503);

app.use("/test", express.static("test"));
app.use("/client", express.static("test")); 

app.use("/src/", express.static("src"));

app.ws("/", function (ws, req) {
    thorIO.addWebSocket(ws,req);
});

app.listen(process.env.PORT || 1337);
/// add an extra endpoint that allows the SimpleTransport (protocol)


