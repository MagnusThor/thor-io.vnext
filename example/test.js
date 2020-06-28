"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const MyController_1 = require("./controllers/MyController");
const Broker_1 = require("../src/Controllers/BrokerController/Broker");
const __1 = require("..");
console.clear();
let port = +process.env.PORT;
let server;
let app = express_1.default();
let rtc = new __1.ThorIO([
    MyController_1.MyController,
    Broker_1.BrokerController
]);
let rootPath = path_1.default.resolve('.');
let clientPath = path_1.default.join(rootPath, "example");
if (fs_1.default.existsSync(clientPath)) {
    console.log(`Serving client files from ${clientPath}.`);
    app.use("/", express_1.default.static(clientPath));
}
else {
    console.log(`Serving no client files.`);
    app.get("/", (_, res) => res.send('Kollokvium WebSocket Server is running'));
}
port = port || 1337;
server = http_1.default.createServer((req, res) => {
    app(req, res);
});
const ws = new ws_1.default.Server({ server });
ws.on('connection', (ws, req) => {
    rtc.addWebSocket(ws, req);
});
server.listen(port);
console.log(`Kollokvium version ${process.env.KOLLOKVIUM_VERSION} is listening on ${port}`);
