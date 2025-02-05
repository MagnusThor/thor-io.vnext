"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = void 0;
class Signal {
    constructor(recipient, sender, message) {
        this.recipient = recipient; // Initializes the recipient
        this.sender = sender; // Initializes the sender
        this.message = message; // Initializes the message
    }
}
exports.Signal = Signal;
