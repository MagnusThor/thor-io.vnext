"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextMessage = void 0;
const BufferUtils_1 = require("../Utils/BufferUtils");
const StringUtils_1 = require("../Utils/StringUtils");
/**
 * Represents a text message with optional binary data.
 *
 * @export
 * @class TextMessage
 */
class TextMessage {
    /**
     * Gets the JSON representation of the message.
     *
     * @readonly
     * @type {any}
     */
    get JSON() {
        return {
            T: this.T,
            D: JSON.stringify(this.D),
            C: this.C,
            I: this.I,
            F: this.F,
        };
    }
    /**
     * Creates an instance of `TextMessage`.
     *
     * @param {string} topic - Topic of the message.
     * @param {any} data - Data payload of the message.
     * @param {string} controller - Controller of the message.
     * @param {Buffer} [arrayBuffer] - Optional binary data.
     * @param {string} [uuid] - Optional unique identifier.
     * @param {boolean} [isFinal] - Indicates if this is the final message in a sequence.
     */
    constructor(topic, data, controller, arrayBuffer, uuid, isFinal) {
        /**
         * Indicates whether the message contains binary data.
         *
         * @type {boolean}
         */
        this.isBinary = false;
        this.D = data;
        this.T = topic;
        this.C = controller;
        this.B = arrayBuffer;
        this.I = uuid || StringUtils_1.StringUtils.newGuid();
        this.F = isFinal !== null && isFinal !== void 0 ? isFinal : true; // Default to true if not provided
        if (arrayBuffer) {
            this.isBinary = true;
        }
    }
    /**
     * Returns a string representation of the message.
     *
     * @returns {string} The JSON string representation of the message.
     */
    toString() {
        return JSON.stringify(this.JSON);
    }
    /**
     * Creates a `TextMessage` instance from a `Buffer`.
     *
     * @static
     * @param {Buffer} buffer - The buffer containing the message data.
     * @returns {TextMessage} The parsed `TextMessage` instance.
     */
    static fromArrayBuffer(buffer) {
        const headerLen = 8;
        const header = buffer.slice(0, headerLen);
        const payloadLength = BufferUtils_1.BufferUtils.arrayToLong(header);
        const message = buffer.slice(headerLen, payloadLength + headerLen);
        const blobOffset = headerLen + payloadLength;
        const blob = buffer.slice(blobOffset, buffer.byteLength);
        const data = JSON.parse(message.toString());
        return new TextMessage(data.T, data.D, data.C, blob, data.I, data.F);
    }
    /**
     * Converts the `TextMessage` to a `Buffer`.
     *
     * @returns {Buffer} The buffer representation of the message.
     */
    toArrayBuffer() {
        const messagePayload = this.toString();
        const payloadLength = messagePayload.length;
        const header = Buffer.from(BufferUtils_1.BufferUtils.longToArray(payloadLength));
        const message = Buffer.from(messagePayload, 'utf-8');
        const blob = this.B ? Buffer.from(this.B) : Buffer.alloc(0);
        return Buffer.concat([header, message, blob]);
    }
}
exports.TextMessage = TextMessage;
