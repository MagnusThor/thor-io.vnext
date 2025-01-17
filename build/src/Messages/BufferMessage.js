"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferMessage = void 0;
const TextMessage_1 = require("./TextMessage");
/**
 *
 *
 * @export
 * @class BufferMessage
 * @implements {ITransportMessage}
 */
class BufferMessage {
    /**
     * Creates an instance of BufferMessage.
     *
     * @param {Buffer} data
     * @param {boolean} isBinary
     *
     * @memberOf BufferMessage
     */
    constructor(data, isBinary) {
        this.data = data;
        this.isBinary = isBinary;
    }
    /**
     *
     *
     * @returns {TextMessage}
     *
     * @memberOf BufferMessage
     */
    toMessage() {
        const headerLen = 3;
        const tLen = this.data.readUInt8(0);
        const cLen = this.data.readUInt8(1);
        const dLen = this.data.readUInt8(2);
        let offset = headerLen;
        const topic = this.data.toString("utf-8", offset, tLen + offset);
        offset += tLen;
        const controller = this.data.toString("utf-8", offset, offset + cLen);
        offset += cLen;
        const data = this.data.toString("utf-8", offset, offset + dLen);
        let message = new TextMessage_1.TextMessage(topic, data, controller);
        return message;
    }
    /**
     *
     *
     * @returns {Buffer}
     *
     * @memberOf BufferMessage
     */
    toBuffer() {
        let message = JSON.parse(this.data.toString());
        const header = 3;
        let offset = 0;
        const tLen = message.T.length;
        const dLen = message.D.length;
        const cLen = message.C.length;
        let bufferSize = header + tLen + dLen + cLen;
        let buffer = new Buffer(bufferSize);
        buffer.writeUInt8(tLen, 0);
        buffer.writeUInt8(cLen, 1);
        buffer.writeInt8(dLen, 2);
        offset = header;
        buffer.write(message.T, offset);
        offset += tLen;
        buffer.write(message.C, offset);
        offset += cLen;
        buffer.write(message.D, offset);
        return buffer;
    }
}
exports.BufferMessage = BufferMessage;
