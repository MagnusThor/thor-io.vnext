export class Signal {
    recipient: string;  // The recipient of the signal
    sender: string;     // The sender of the signal
    message: string;    // The content of the signal/message

    constructor(recipient: string, sender: string, message: string) {
        this.recipient = recipient;  // Initializes the recipient
        this.sender = sender;        // Initializes the sender
        this.message = message;      // Initializes the message
    }
}
