"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketMessage_1 = require("../Messages/WebSocketMessage");
const StringUtils_1 = require("../Utils/StringUtils");
class WebSocketMessageTransport {
    constructor(socket, req) {
        this.id = StringUtils_1.StringUtils.newGuid();
        this.request = req;
        this.socket = socket;
        this.socket.addEventListener("message", (event) => {
            this.onMessage(new WebSocketMessage_1.WebSocketMessage(event.data, typeof (event.data) != "string"));
        });
    }
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
    get readyState() {
        return this.socket.readyState;
    }
    ping() {
        this.socket["ping"]();
    }
}
exports.WebSocketMessageTransport = WebSocketMessageTransport;
