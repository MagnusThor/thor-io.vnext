"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketMessage_1 = require("../Messages/WebSocketMessage");
class WebSocketMessageTransport {
    static newGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
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
    constructor(socket) {
        this.id = WebSocketMessageTransport.newGuid();
        this.socket = socket;
        this.socket.addEventListener("message", (event) => {
            this.onMessage(new WebSocketMessage_1.WebSocketMessage(event.data, typeof (event.data) != "string"));
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
