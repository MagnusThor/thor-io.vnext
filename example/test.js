"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let express = require("express");
let app = express();
const ThorIO_1 = require("../src/ThorIO");
const MyController_1 = require("../example/controllers/MyController");
const Broker_1 = require("../src/Controllers/BrokerController/Broker");
let Server = new ThorIO_1.ThorIO([
    MyController_1.MyController,
    Broker_1.BrokerController
]);
require("express-ws")(app);
app.use("/", express.static("example"));
app.ws("/", (ws, req) => {
    Server.addWebSocket(ws, req);
});
var port = process.env.PORT || 1337;
app.listen(port);
console.log("thor-io is serving on", port.toString());
