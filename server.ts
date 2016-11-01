
import {ThorIO} from "./src/thor-io";
import {ChatController} from "./exampleControllers/Chat.Controller"
import {TodoApp} from "./test/todo-app/controllers/Todo.Controller"

let express = require("express");
let app = express();
let expressWs = require("express-ws")(app);

// Set up fake storage, just a static 'class' ...
new TodoApp.Realtime.Todos();

let thorIO = new ThorIO.Engine([
    ChatController,
    ThorIO.Controllers.BrokerController,
    TodoApp.Realtime.TodoController
]);
thorIO.addEndpoint(ThorIO.SimpleTransport,"127.0.0.1",4502) 

app.use("/test", express.static("test"));
app.use("/client", express.static("test")); 

app.use("/src/", express.static("src"));

app.ws("/", function (ws, req) {
    thorIO.addWebSocket(ws,req);
});

app.listen(process.env.PORT || 1337);
/// add an extra endpoint that allows the SimpleTransport (protocol)


