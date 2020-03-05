"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WebSocketMessage {
    constructor(data, binary) {
        this.data = data;
        this.binary = binary;
    }
    toBuffer() {
        throw "not yet implemented";
    }
    toMessage() {
        return JSON.parse(this.data);
    }
}
exports.WebSocketMessage = WebSocketMessage;
