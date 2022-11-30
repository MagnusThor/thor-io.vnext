"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextMessage = void 0;
const BufferUtils_1 = require("../Utils/BufferUtils");
const thor_io_client_vnext_1 = require("thor-io.client-vnext");
class TextMessage {
    get JSON() {
        return {
            T: this.T,
            D: JSON.stringify(this.D),
            C: this.C,
            I: this.I,
            F: this.F
        };
    }
    ;
    constructor(topic, data, controller, arrayBuffer, uuid, isFinal) {
        this.D = data;
        this.T = topic;
        this.C = controller;
        this.B = arrayBuffer;
        this.I = uuid || thor_io_client_vnext_1.Utils.newGuid();
        this.F = true;
        if (arrayBuffer)
            this.isBinary = true;
    }
    toString() {
        return JSON.stringify(this.JSON);
    }
    static fromArrayBuffer(buffer) {
        let headerLen = 8;
        let header = buffer.slice(0, 8);
        let payloadLength = BufferUtils_1.BufferUtils.arrayToLong(header);
        let message = buffer.slice(headerLen, payloadLength + headerLen);
        let blobOffset = headerLen + payloadLength;
        let blob = buffer.slice(blobOffset, buffer.byteLength);
        let data = JSON.parse(message.toString());
        return new TextMessage(data.T, data.D, data.C, blob, data.I, data.F);
    }
    toArrayBuffer() {
        let messagePayload = this.toString();
        let payloadLength = messagePayload.length;
        let header = new Buffer(BufferUtils_1.BufferUtils.longToArray(payloadLength));
        let message = new Buffer(payloadLength);
        message.write(messagePayload, 0, payloadLength, "utf-8");
        var blob = new Buffer(this.B);
        var buffer = Buffer.concat([header, message, blob]);
        return buffer;
    }
}
exports.TextMessage = TextMessage;
