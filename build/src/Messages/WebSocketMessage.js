"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketMessage = void 0;
/**
 * Represents a WebSocket message, encapsulating data and its type (binary or text).
 *
 * @export
 * @class WebSocketMessage
 * @implements {ITransportMessage}
 */
class WebSocketMessage {
    /**
     * Creates an instance of `WebSocketMessage`.
     *
     * @param {string} data - The raw message data as a string.
     * @param {boolean} isBinary - Indicates whether the message is binary.
     */
    constructor(data, isBinary) {
        this.data = data;
        this.isBinary = isBinary;
    }
    /**
     * Converts the message to a `Buffer` object.
     * **Note:** This method is not yet implemented.
     *
     * @throws {Error} Throws an error indicating that the method is not implemented.
     * @returns {Buffer}
     */
    toBuffer() {
        throw new Error("toBuffer is not yet implemented");
    }
    /**
     * Parses the raw string data and converts it into a `TextMessage` instance.
     *
     * @returns {TextMessage} The parsed `TextMessage` object.
     */
    toMessage() {
        return JSON.parse(this.data);
    }
}
exports.WebSocketMessage = WebSocketMessage;
