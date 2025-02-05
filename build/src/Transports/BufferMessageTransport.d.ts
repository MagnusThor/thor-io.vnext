import { IncomingMessage } from 'http';
import * as net from 'net';
import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
/**
 * A transport implementation for handling buffer-based messages over a socket.
 *
 * @export
 * @class BufferMessageTransport
 * @implements {ITransport}
 */
export declare class BufferMessageTransport implements ITransport {
    socket: net.Socket;
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
    onMessage: (message: ITransportMessage) => void;
    /**
     * The underlying socket used for communication.
     *
     * @type {net.Socket}
     */
    constructor(socket: net.Socket);
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
    onClose: () => void;
    /**
     * Event handler for when the transport connection is opened.
     *
     * @type {() => void}
     */
    onOpen: () => void;
    /**
     * The ready state of the transport connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState(): number;
    /**
     * Sends a string message over the transport.
     *
     * @param {string} data - The message to send.
     */
    send(data: string): void;
    /**
     * Adds an event listener to the underlying socket.
     *
     * @param {string} name - The name of the event.
     * @param {Function} fn - The callback function to invoke when the event occurs.
     */
    addEventListener(name: string, fn: any): void;
    /**
     * Sends a ping message (no-op for this transport).
     */
    ping(): void;
    /**
     * Closes the transport connection and destroys the socket.
     */
    close(): void;
}
