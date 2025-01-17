"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeMessage = void 0;
/**
 * Represents a message transported via pipes, encapsulating a `TextMessage`.
 *
 * @export
 * @class PipeMessage
 * @implements {ITransportMessage}
 */
class PipeMessage {
    /**
     * Creates an instance of `PipeMessage`.
     *
     * @param {*} data - The raw data representing the message.
     * @param {boolean} isBinary - Indicates if the data is in binary format.
     */
    constructor(data, isBinary) {
        this.data = data;
        this.isBinary = isBinary;
        this.message = JSON.parse(data);
        this.arr = [this.message.C, this.message.T, this.message.D];
    }
    /**
     * Serializes the `PipeMessage` to a `Buffer`.
     *
     * @returns {Buffer} A buffer containing the serialized message data.
     */
    toBuffer() {
        return Buffer.from(this.arr.join("|"), 'utf-8');
    }
    /**
     * Converts the `PipeMessage` back to a `TextMessage` instance.
     *
     * @returns {TextMessage} The encapsulated `TextMessage`.
     */
    toMessage() {
        return this.message;
    }
}
exports.PipeMessage = PipeMessage;
