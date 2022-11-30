"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = void 0;
class Signal {
    constructor(recipient, sender, message) {
        this.recipient = recipient;
        this.sender = sender;
        this.message = message;
    }
}
exports.Signal = Signal;
