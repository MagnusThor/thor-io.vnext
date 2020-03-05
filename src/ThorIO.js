"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Plugin_1 = require("./Plugin");
const Connection_1 = require("./Connection");
const WebSocketMessageTransport_1 = require("./Transports/WebSocketMessageTransport");
const net = require("net");
class ThorIO {
    constructor(controllers) {
        this.endpoints = [];
        this.connections = [];
        this.controllers = [];
        controllers.forEach((ctrl) => {
            if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                throw "Faild to register on of the specified Controller's";
            }
            var plugin = new Plugin_1.Plugin(ctrl);
            this.controllers.push(plugin);
        });
    }
    createSealdControllers() {
        this.controllers.forEach((controller) => {
            if (Reflect.getMetadata("seald", controller.instance)) {
                new controller.instance(new Connection_1.Connection(null, this.connections, this.controllers));
            }
        });
    }
    removeConnection(id, reason) {
        try {
            let connection = this.connections.find((pre) => {
                return pre.id === id;
            });
            let index = this.connections.indexOf(connection);
            if (index >= 0)
                this.connections.splice(index, 1);
        }
        catch (error) {
        }
    }
    addEndpoint(typeOfTransport, host, port) {
        let endpoint = net.createServer((socket) => {
            let transport = new typeOfTransport(socket);
            this.addConnection(transport);
        });
        endpoint.listen(port, host, ((listener) => {
        }));
        this.endpoints.push(endpoint);
        return endpoint;
    }
    addWebSocket(ws, req) {
        let transport = new WebSocketMessageTransport_1.WebSocketMessageTransport(ws);
        this.addConnection(transport);
    }
    addConnection(transport) {
        transport.addEventListener("close", (reason) => {
            this.removeConnection(transport.id, reason);
        });
        this.connections.push(new Connection_1.Connection(transport, this.connections, this.controllers));
    }
}
exports.ThorIO = ThorIO;
