"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThorIO = void 0;
const Plugin_1 = require("./Plugin");
const WebSocketMessageTransport_1 = require("./Transports/WebSocketMessageTransport");
const net = __importStar(require("net"));
const Connection_1 = require("./Connection/Connection");
class ThorIO {
    static createInstance(controllers) {
        return new ThorIO(controllers);
    }
    constructor(controllers) {
        this.endpoints = new Array();
        this.connections = new Map();
        this.controllers = new Array();
        controllers.forEach((ctrl) => {
            if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                throw "Faild to register on of the specified Controller's";
            }
            let plugin = new Plugin_1.Plugin(ctrl);
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
            this.connections.delete(id);
        }
        catch (error) {
        }
    }
    addEndpoint(typeOfTransport, host, port) {
        let endpoint = net.createServer((socket) => {
            let transport = new typeOfTransport(socket);
            this.addConnection(transport);
        });
        endpoint.listen(port, host, (() => {
        }));
        this.endpoints.push(endpoint);
        return endpoint;
    }
    addWebSocket(ws, req) {
        let transport = new WebSocketMessageTransport_1.WebSocketMessageTransport(ws, req);
        this.addConnection(transport);
    }
    addConnection(transport) {
        transport.addEventListener("close", (reason) => {
            if (transport.onClose)
                transport.onClose(reason);
            this.removeConnection(transport.id, reason);
        });
        this.connections.set(transport.id, new Connection_1.Connection(transport, this.connections, this.controllers));
    }
}
exports.ThorIO = ThorIO;
