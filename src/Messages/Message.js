"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils/Utils");
class Message {
    get JSON() {
        return {
            T: this.T,
            D: JSON.stringify(this.D),
            C: this.C
        };
    }
    ;
    constructor(topic, data, controller, arrayBuffer) {
        this.D = data;
        this.T = topic;
        this.C = controller;
        this.B = arrayBuffer;
        if (arrayBuffer)
            this.isBinary = true;
    }
    toString() {
        return JSON.stringify(this.JSON);
    }
    static fromArrayBuffer(buffer) {
        let headerLen = 8;
        let header = buffer.slice(0, 8);
        let payloadLength = Utils_1.Utils.arrayToLong(header);
        let message = buffer.slice(headerLen, payloadLength + headerLen);
        let blobOffset = headerLen + payloadLength;
        let blob = buffer.slice(blobOffset, buffer.byteLength);
        let data = JSON.parse(message.toString());
        return new Message(data.T, data.D, data.C, blob);
    }
    toArrayBuffer() {
        let messagePayload = this.toString();
        let payloadLength = messagePayload.length;
        let header = new Buffer(Utils_1.Utils.longToArray(payloadLength));
        let message = new Buffer(payloadLength);
        message.write(messagePayload, 0, payloadLength, "utf-8");
        var blob = new Buffer(this.B);
        var buffer = Buffer.concat([header, message, blob]);
        return buffer;
    }
}
exports.Message = Message;
