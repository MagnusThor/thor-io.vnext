"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../Messages/Message");
const PipeMessage_1 = require("../Messages/PipeMessage");
const StringUtils_1 = require("../Utils/StringUtils");
class PipeMessageTransport {
    constructor(socket) {
        this.socket = socket;
        this.id = StringUtils_1.StringUtils.newGuid();
        socket.addListener("data", (buffer) => {
            let args = buffer.toString().split("|");
            let message = new Message_1.Message(args[1], args[2], args[0]);
            this.onMessage(new PipeMessage_1.PipeMessage(message.toString(), false));
        });
    }
    send(data) {
        let message = new PipeMessage_1.PipeMessage(data, false);
        this.socket.write(message.toBuffer());
    }
    close(reason, message) {
        this.socket.destroy();
    }
    addEventListener(name, fn) {
        this.socket.addListener(name, fn);
    }
    get readyState() {
        return 1;
    }
    ping() {
        return;
    }
}
exports.PipeMessageTransport = PipeMessageTransport;
