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
const TextMessage_1 = require("../Messages/TextMessage");
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
    /**
     * Publishes a message to all connected clients that are subscribed to the specified topic.
     * @template T - The type of data being published.
     * @param data - The data to publish.
     * @param topic - The topic to publish to.
     * @param controller - The controller handling the message.
     */
    publishToAll(data, topic, controller) {
        let msg = new TextMessage_1.TextMessage(topic, data, controller);
        this.connections.forEach(connection => {
            const ctrl = connection.tryGetController(controller);
            if (ctrl) {
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            }
        });
    }
    publishTo(connectionId, data, topic, controller) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            const ctrl = connection.tryGetController(controller);
            if (ctrl) {
                ctrl.publish(data, topic, controller);
            }
        }
    }
    /**
     * Invokes a method on all connected clients for a specific controller and topic.
     *
     * @param data - The data to be sent to each controller's invoke method.
     * @param topic - The topic or event name to be invoked.
     * @param controller - The name of the controller to target on each connection.
     * @param buffer - Optional binary data to be passed along with the invocation.
     */
    invokeToAll(data, topic, controller, buffer) {
        this.connections.forEach((connection) => {
            const ctrl = connection.tryGetController(controller);
            if (ctrl) {
                ctrl.invoke(data, topic, controller, buffer);
            }
        });
    }
    /**
     * Invokes a method on a connected client.
     * @param connectionId - The unique identifier of the target client connection.
     * @param data - The data payload to send to the client.
     * @param topic - The topic or method name to invoke on the client.
     * @param controller - The name of the controller handling the invocation.
     * @param buffer - Optional buffer data to include with the invocation.
     */
    invokeOnClient(connectionId, data, topic, controller, buffer) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            let targetController = connection.tryGetController(controller);
            if (targetController) {
                targetController.invoke(data, topic, controller, buffer);
            }
        }
    }
    /**
     * Finds and returns an array of controllers of the specified type that match the given predicate.
     *
     * @template T - The type of the controller to find.
     * @param controller - The name of the controller to search for.
     * @param predicate - A function that takes a controller instance and returns a boolean indicating whether it matches the criteria.
     * @returns An array of matching `ControllerBase` instances if any are found; otherwise, `undefined`.
     */
    findConnecion(controller, predicate) {
        let connections = Array.from(this.connections.values()).map((p) => {
            return p.tryGetController(controller);
        });
        const result = connections.filter(predicate).filter((c) => c !== undefined);
        return result.length > 0 ? result : undefined;
    }
}
exports.ThorIOServer = ThorIOServer;
