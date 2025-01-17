"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeMessageTransport = void 0;
const PipeMessage_1 = require("../Messages/PipeMessage");
const TextMessage_1 = require("../Messages/TextMessage");
const StringUtils_1 = require("../Utils/StringUtils");
/**
 * A transport implementation for handling pipe-based messages over a socket.
 *
 * @export
 * @class PipeMessageTransport
 * @implements {ITransport}
 */
class PipeMessageTransport {
    /**
     * Sends data over the transport.
     *
     * @param {any} data - The data to send.
     */
    send(data) {
        const message = new PipeMessage_1.PipeMessage(data, false);
        this.socket.write(message.toBuffer());
    }
    /**
     * Closes the transport connection and destroys the socket.
     *
     * @param {number} reason - The reason code for closing the connection.
     * @param {any} message - An optional message describing the closure.
     */
    close(reason, message) {
        this.socket.destroy();
    }
    /**
     * Adds an event listener to the underlying socket.
     *
     * @param {string} name - The name of the event.
     * @param {Function} fn - The callback function to invoke when the event occurs.
     */
    addEventListener(name, fn) {
        this.socket.addListener(name, fn);
    }
    /**
     * The ready state of the transport connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState() {
        return 1; // Open
    }
    /**
     * Sends a ping message (no-op for this transport).
     */
    ping() {
        return;
    }
    /**
     * Creates an instance of PipeMessageTransport.
     *
     * @param {net.Socket} socket - The underlying socket used for communication.
     */
    constructor(socket) {
        this.socket = socket;
        /**
         * Event handler for receiving transport messages.
         *
         * @type {(message: any) => void}
         */
        this.onMessage = () => { };
        /**
         * Event handler for when the transport connection is closed.
         *
         * @type {() => void}
         */
        this.onClose = () => { };
        /**
         * Event handler for when the transport connection is opened.
         *
         * @type {() => void}
         */
        this.onOpen = () => { };
        this.id = StringUtils_1.StringUtils.newGuid();
        socket.addListener("data", (buffer) => {
            const args = buffer.toString().split("|");
            const message = new TextMessage_1.TextMessage(args[1], args[2], args[0]);
            this.onMessage(new PipeMessage_1.PipeMessage(message.toString(), false));
        });
    }
}
exports.PipeMessageTransport = PipeMessageTransport;
