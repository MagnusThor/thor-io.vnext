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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThorIOServer = void 0;
const net = __importStar(require("net"));
const Connection_1 = require("../Connection/Connection");
const Plugin_1 = require("../Server/Plugin");
const WebSocketMessageTransport_1 = require("../Transports/WebSocketMessageTransport");
/**
 * ThorIOServer server class for managing connections and controllers.
 */
class ThorIOServer {
    /**
     * Creates a new instance of ThorIOServer.
     *
     * @param {Array<ControllerBase>} controllers An array of controllers to register.
     * @returns {ThorIOServer} A new ThorIOServer instance.
     */
    static createInstance(controllers) {
        return new ThorIOServer(controllers);
    }
    /**
     * Constructor for ThorIOServer.
     *
     * @param {Array<ControllerBase>} controllers An array of controllers to register.
     */
    constructor(controllers) {
        this.endpoints = new Array();
        this.connections = new Map();
        this.controllers = new Map();
        controllers.forEach((ctrl) => {
            if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                throw "Failed to register one of the specified Controllers, missing ControllerProperties alias attribute";
            }
            else {
                console.log(`Starting registering the '${Reflect.getMetadata("alias", ctrl)}' controller.`);
            }
            const plugin = new Plugin_1.Plugin(ctrl);
            this.controllers.set(Reflect.getMetadata("alias", ctrl), plugin);
        });
    }
    /**
     * Removes a connection from the server.
     *
     * @param {string} id The ID of the connection to remove.
     * @param {number} reason The reason for removing the connection.
     */
    removeConnection(id, reason) {
        try {
            this.connections.delete(id);
        }
        catch (error) {
            console.warn(`Failed to delete a connection with id ${id}, reason: ${reason}`);
        }
    }
    /**
     * Adds a new endpoint to the server using the specified transport type, host, and port.
     *
     * @param {new (...args: any[]) => ITransport} typeOfTransport A constructor function for the transport type.
     * @param {string} host The hostname or IP address to listen on.
     * @param {number} port The port number to listen on.
     * @returns {net.Server} The created net.Server instance.
     */
    addEndpoint(typeOfTransport, host, port) {
        const endpoint = net.createServer((socket) => {
            const transport = new typeOfTransport(socket);
            this.addConnection(transport);
        });
        endpoint.listen(port, host, ((listener) => {
            // do op
        }));
        this.endpoints.push(endpoint);
        return endpoint;
    }
    /**
     * Adds a WebSocket connection to the server.
     *
     * @param {any} ws The WebSocket object.
     * @param {any} req The request object (if applicable).
     */
    addWebSocket(ws, req) {
        const transport = new WebSocketMessageTransport_1.WebSocketMessageTransport(ws, req);
        this.addConnection(transport);
    }
    /**
     * Adds a new connection to the server's internal state.
     *
     * @param {ITransport} transport The transport object representing the connection.
     */
    addConnection(transport) {
        transport.addEventListener("close", (reason) => {
            if (transport.onClose)
                transport.onClose(reason);
            this.removeConnection(transport.id, reason);
        });
        this.connections.set(transport.id, new Connection_1.Connection(transport, this.connections, this.controllers));
    }
}
exports.ThorIOServer = ThorIOServer;
