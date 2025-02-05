"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketMessageTransport = void 0;
const WebSocketMessage_1 = require("../Messages/WebSocketMessage");
const StringUtils_1 = require("../Utils/StringUtils");
/**
 * A transport class for handling WebSocket communication and converting messages
 * to/from the `WebSocketMessage` format.
 *
 * @export
 * @class WebSocketMessageTransport
 * @implements {ITransport}
 */
class WebSocketMessageTransport {
    /**
     * Sends data through the WebSocket connection.
     *
     * @param {any} data - The data to be sent.
     */
    send(data) {
        this.socket.send(data);
    }
    /**
     * Closes the WebSocket connection.
     *
     * @param {number} reason - The reason code for closing the connection.
     * @param {string} message - Optional message providing details about the closure.
     */
    close(reason, message) {
        this.socket.close(reason, message);
    }
    /**
     * Adds an event listener to the WebSocket instance.
     *
     * @param {string} name - The event name.
     * @param {Function} fn - The callback function to execute when the event occurs.
     */
    addEventListener(name, fn) {
        this.socket.addEventListener(name, fn);
    }
    /**
     * Creates an instance of `WebSocketMessageTransport`.
     *
     * @param {WebSocket} socket - The WebSocket object to use for communication.
     * @param {IncomingMessage} req - The initial HTTP request associated with the connection.
     */
    constructor(socket, req) {
        /**
         * Callback for handling incoming messages. Defaults to creating a `WebSocketMessage`.
         *
         * @type {(message: ITransportMessage) => void}
         */
        this.onMessage = (message) => {
            // Default implementation
        };
        /**
         * Callback for handling the WebSocket `close` event.
         *
         * @type {(ev: CloseEvent) => void}
         */
        this.onClose = (ev) => { };
        /**
         * Callback for handling the WebSocket `open` event.
         *
         * @type {(ev: Event) => void}
         */
        this.onOpen = (ev) => { };
        this.id = StringUtils_1.StringUtils.newGuid();
        this.request = req;
        this.socket = socket;
        this.socket.addEventListener("message", (event) => {
            this.onMessage(new WebSocketMessage_1.WebSocketMessage(event.data, typeof event.data !== "string"));
        });
    }
    /**
     * The current ready state of the WebSocket connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState() {
        return this.socket.readyState;
    }
    /**
     * Sends a ping message to maintain the connection or test latency.
     */
    ping() {
        var _a, _b;
        // Assumes the WebSocket implementation supports ping.
        (_b = (_a = this.socket).ping) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
}
exports.WebSocketMessageTransport = WebSocketMessageTransport;
