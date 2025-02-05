import { IncomingMessage } from 'http';
import * as net from 'net';

import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { BufferMessage } from '../Messages/BufferMessage';
import { StringUtils } from '../Utils/StringUtils';

/**
 * A transport implementation for handling buffer-based messages over a socket.
 *
 * @export
 * @class BufferMessageTransport
 * @implements {ITransport}
 */
export class BufferMessageTransport implements ITransport {
    /**
     * Unique identifier for this transport instance.
     *
     * @type {string}
     */
    id: string;

    /**
     * Event handler for receiving transport messages.
     *
     * @type {(message: ITransportMessage) => void}
     */
    onMessage: (message: ITransportMessage) => void = (message: BufferMessage) => { };

    /**
     * The underlying socket used for communication.
     *
     * @type {net.Socket}
     */
    constructor(public socket: net.Socket) {
        this.id = StringUtils.newGuid();
        this.socket.addListener("data", (buffer: Buffer) => {
            const bm = new BufferMessage(buffer, false);
            this.onMessage(bm);
        });
    }

    /**
     * The incoming HTTP request associated with the transport (if any).
     *
     * @type {IncomingMessage | any}
     */
    request: IncomingMessage | any;


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

    /**
     * The ready state of the transport connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState() {
        return 1; // Open
    }

    /**
     * Sends a string message over the transport.
     *
     * @param {string} data - The message to send.
     */
    send(data: string) {
        const bm = new BufferMessage(Buffer.from(data), false);
        this.socket.write(bm.toBuffer());
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
     * Sends a ping message (no-op for this transport).
     */
    ping() {
        return;
    }

    /**
     * Closes the transport connection and destroys the socket.
     */
    close() {
        this.socket.destroy();
    }
}
