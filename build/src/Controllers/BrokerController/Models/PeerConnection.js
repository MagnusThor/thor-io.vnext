"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerConnection = void 0;
class PeerConnection {
    constructor(context, peerId) {
        this.peerId = ""; // The unique identifier for the peer. Defaults to an empty string.
        this.context = context; // Initializes the context of the connection.
        this.peerId = peerId; // Initializes the peer's unique identifier.
    }
}
exports.PeerConnection = PeerConnection;
