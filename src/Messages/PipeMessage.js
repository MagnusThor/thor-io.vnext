"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PipeMessage {
    constructor(data, binary) {
        this.data = data;
        this.binary = binary;
        this.message = JSON.parse(this.data);
        this.arr = new Array();
        this.arr.push(this.message.C);
        this.arr.push(this.message.T);
        this.arr.push(this.message.D);
    }
    toBuffer() {
        return new Buffer(this.arr.join("|"));
    }
    toMessage() {
        return this.message;
    }
}
exports.PipeMessage = PipeMessage;
