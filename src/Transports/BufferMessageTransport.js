"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BufferMessage_1 = require("../Messages/BufferMessage");
class BufferMessageTransport {
    constructor(socket) {
        this.socket = socket;
        this.id = this.newGuid();
        this.socket.addListener("data", (buffer) => {
            let bm = new BufferMessage_1.BufferMessage(buffer, false);
            this.onMessage(bm);
        });
    }
    newGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
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
