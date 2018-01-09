"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let express = require("express");
let app = express();
var thorio = require("../index").ThorIO;
const MyController_1 = require("../test/controllers/MyController");
var thorIO = new thorio.Engine([
    MyController_1.MyController,
]);
var expressWs = require("express-ws")(app);
app.use("/", express.static("debug"));
app.use("/lib", express.static("node_modules"));
app.ws("/", function (ws, req) {
    thorIO.addWebSocket(ws, req);
});
var port = process.env.PORT || 1337;
app.listen(port);
console.log("thor-io is serving on ", port.toString());
//# sourceMappingURL=test.js.map