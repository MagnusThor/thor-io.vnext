"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketMessage_1 = require("../Messages/WebSocketMessage");
const Utils_1 = require("../Utils/Utils");
class WebSocketMessageTransport {
    ;
    send(data) {
        this.socket.send(data);
    }
    close(reason, message) {
        this.socket.close(reason, message);
    }
    addEventListener(name, fn) {
        this.socket.addEventListener(name, fn);
    }
    constructor(socket) {
        this.id = Utils_1.Utils.newGuid();
        this.socket = socket;
        this.socket.addEventListener("message", (event) => {
            this.onMessage(new WebSocketMessage_1.WebSocketMessage(event.data, event.binary));
        });
    }
    get readyState() {
        return this.socket.readyState;
    }
    ping() {
        this.socket["ping"]();
    }
}
exports.WebSocketMessageTransport = WebSocketMessageTransport;
