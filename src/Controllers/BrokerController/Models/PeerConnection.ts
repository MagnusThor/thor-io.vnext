export class PeerConnection {
    context: string;  // The context for the peer connection (e.g., a session or room).
    peerId: string = ""; // The unique identifier for the peer. Defaults to an empty string.
    language: string | undefined;
    constructor(context: string, peerId: string) {
        this.context = context;  // Initializes the context of the connection.
        this.peerId = peerId;    // Initializes the peer's unique identifier.
    }
    setLanguage(language: string) {
        this.language = language;
    }
}
