"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let express = require("express");
let app = express();
var thorio = require("../index").ThorIO;
const MyController_1 = require("../test/controllers/MyController");
const ThorIO_1 = require("../src/ThorIO");
const Controller_1 = require("../src/Controllers/BrokerController/Controller");
let Server = new ThorIO_1.ThorIO([
    MyController_1.MyController,
    Controller_1.BrokerController
]);
require("express-ws")(app);
app.use("/", express.static("debug"));
app.use("/lib", express.static("node_modules"));
app.ws("/", function (ws, req) {
    Server.addWebSocket(ws, req);
});
var port = process.env.PORT || 1337;
app.listen(port);
console.log("thor-io is serving on", port.toString());
