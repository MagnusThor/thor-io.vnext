"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferMessageTransport = void 0;
const BufferMessage_1 = require("../Messages/BufferMessage");
const StringUtils_1 = require("../Utils/StringUtils");
/**
 * A transport implementation for handling buffer-based messages over a socket.
 *
 * @export
 * @class BufferMessageTransport
 * @implements {ITransport}
 */
class BufferMessageTransport {
    /**
     * The underlying socket used for communication.
     *
     * @type {net.Socket}
     */
    constructor(socket) {
        this.socket = socket;
        /**
         * Event handler for receiving transport messages.
         *
         * @type {(message: ITransportMessage) => void}
         */
        this.onMessage = (message) => { };
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
        this.socket.addListener("data", (buffer) => {
            const bm = new BufferMessage_1.BufferMessage(buffer, false);
            this.onMessage(bm);
        });
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
     * Sends a string message over the transport.
     *
     * @param {string} data - The message to send.
     */
    send(data) {
        const bm = new BufferMessage_1.BufferMessage(Buffer.from(data), false);
        this.socket.write(bm.toBuffer());
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
     * Sends a ping message (no-op for this transport).
     */
    ping() {
        return;
    }
    /**
     * Closes the transport connection and destroys the socket.
     */
    close() {
        this.socket.destroy();
    }
}
exports.BufferMessageTransport = BufferMessageTransport;
