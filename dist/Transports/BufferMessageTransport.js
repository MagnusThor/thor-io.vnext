"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferMessageTransport = void 0;
const BufferMessage_1 = require("../Messages/BufferMessage");
const StringUtils_1 = require("../Utils/StringUtils");
class BufferMessageTransport {
    constructor(socket) {
        this.socket = socket;
        this.id = StringUtils_1.StringUtils.newGuid();
        this.socket.addListener("data", (buffer) => {
            let bm = new BufferMessage_1.BufferMessage(buffer, false);
            this.onMessage(bm);
        });
    }
    get readyState() {
        return 1;
    }
    send(data) {
        let bm = new BufferMessage_1.BufferMessage(new Buffer(data), false);
        this.socket.write(bm.toBuffer());
    }
    addEventListener(name, fn) {
        this.socket.addListener(name, fn);
    }
    ping() {
        return;
    }
    close() {
        this.socket.destroy();
    }
}
exports.BufferMessageTransport = BufferMessageTransport;
