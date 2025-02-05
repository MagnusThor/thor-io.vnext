"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThorIO = void 0;
const net = __importStar(require("net"));
const Connection_1 = require("./Connection/Connection");
const Plugin_1 = require("./Plugin");
const WebSocketMessageTransport_1 = require("./Transports/WebSocketMessageTransport");
class MockTransport {
    constructor() {
        this.readyState = 0;
        this.id = 'mock-transport-id';
        this.onMessage = () => { };
        this.onClose = () => { };
        this.onOpen = () => { };
        this.interceptors = new Map();
    }
    addEventListener(topic, fn) {
        throw new Error('Method not implemented.');
    }
    ping() {
        throw new Error('Method not implemented.');
    }
    // Implement other methods of ITransport interface as needed
    send(message) { }
    close(code, reason) { }
}
/**
 * ThorIO server class for managing connections and controllers.
 */
class ThorIO {
    /**
      * Constructor for ThorIO.
      *
      * @param {Array<ControllerBase>} controllers An array of controllers to register.
      */
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
    /**
   * Creates a new instance of ThorIO.
   *
   * @param {Array<ControllerBase>} controllers An array of controllers to register.
   * @returns {ThorIO} A new ThorIO instance.
   */
    static createInstance(controllers) {
        return new ThorIO(controllers);
    }
    /**
      * Creates sealed (standalone) instances of controllers marked with the "seald" metadata.
      */
    createSealdControllers() {
        this.controllers.forEach((controller) => {
            if (Reflect.getMetadata("seald", controller.instance)) {
                new controller.instance(new Connection_1.Connection(new MockTransport(), this.connections, this.controllers));
            }
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
        }
    }
    /**
  * Adds a new endpoint to the server using the specified transport type, host, and port.
  *
  * @param {typeof ITransport} typeOfTransport A constructor function for the transport type.
  * @param {string} host The hostname or IP address to listen on.
  * @param {number} port The port number to listen on.
  * @returns {net.Server} The created net.Server instance.
  */
    addEndpoint(typeOfTransport, host, port) {
        let endpoint = net.createServer((socket) => {
            let transport = new typeOfTransport(socket);
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
        let transport = new WebSocketMessageTransport_1.WebSocketMessageTransport(ws, req);
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
exports.ThorIO = ThorIO;
