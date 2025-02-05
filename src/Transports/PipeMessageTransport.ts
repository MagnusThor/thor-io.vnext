import * as net from 'net';

import { ITransport } from '../Interfaces/ITransport';
import { PipeMessage } from '../Messages/PipeMessage';
import { TextMessage } from '../Messages/TextMessage';
import { StringUtils } from '../Utils/StringUtils';

/**
 * A transport implementation for handling pipe-based messages over a socket.
 *
 * @export
 * @class PipeMessageTransport
 * @implements {ITransport}
 */
export class PipeMessageTransport implements ITransport {
    /**
     * Unique identifier for this transport instance.
     *
     * @type {string}
     */
    id: string;

    /**
     * Event handler for receiving transport messages.
     *
     * @type {(message: any) => void}
     */
    onMessage: (message: any) => void = () => { };

    /**
     * Sends data over the transport.
     *
     * @param {any} data - The data to send.
     */
    send(data: any) {
        const message = new PipeMessage(data, false);
        this.socket.write(message.toBuffer());
    }

    /**
     * Closes the transport connection and destroys the socket.
     *
     * @param {number} reason - The reason code for closing the connection.
     * @param {any} message - An optional message describing the closure.
     */
    close(reason: number, message: any) {
        this.socket.destroy();
    }

    /**
     * Adds an event listener to the underlying socket.
     *
     * @param {string} name - The name of the event.
     * @param {Function} fn - The callback function to invoke when the event occurs.
     */
    addEventListener(name: string, fn: any) {
        this.socket.addListener(name, fn);
    }

    /**
     * The ready state of the transport connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState(): number {
        return 1; // Open
    }

    /**
     * Sends a ping message (no-op for this transport).
     */
    ping() {
        return;
    }

    /**
     * Creates an instance of PipeMessageTransport.
     *
     * @param {net.Socket} socket - The underlying socket used for communication.
     */
    constructor(public socket: net.Socket) {
        this.id = StringUtils.newGuid();
        socket.addListener("data", (buffer: Buffer) => {
            const args = buffer.toString().split("|");
            const message = new TextMessage(args[1], args[2], args[0]);
            this.onMessage(new PipeMessage(message.toString(), false));
        });
    }

    /**
     * The incoming request associated with the transport (if any).
     *
     * @type {any}
     */
    request: any;

  
    /**
     * Event handler for when the transport connection is closed.
     *
     * @type {() => void}
     */
    onClose: () => void = () => { };

    /**
     * Event handler for when the transport connection is opened.
     *
     * @type {() => void}
     */
    onOpen: () => void = () => { };
}
