import * as net from 'net';
import { ITransport } from '../Interfaces/ITransport';
/**
 * A transport implementation for handling pipe-based messages over a socket.
 *
 * @export
 * @class PipeMessageTransport
 * @implements {ITransport}
 */
export declare class PipeMessageTransport implements ITransport {
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
     * @type {(message: any) => void}
     */
    onMessage: (message: any) => void;
    /**
     * Sends data over the transport.
     *
     * @param {any} data - The data to send.
     */
    send(data: any): void;
    /**
     * Closes the transport connection and destroys the socket.
     *
     * @param {number} reason - The reason code for closing the connection.
     * @param {any} message - An optional message describing the closure.
     */
    close(reason: number, message: any): void;
    /**
     * Adds an event listener to the underlying socket.
     *
     * @param {string} name - The name of the event.
     * @param {Function} fn - The callback function to invoke when the event occurs.
     */
    addEventListener(name: string, fn: any): void;
    /**
     * The ready state of the transport connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState(): number;
    /**
     * Sends a ping message (no-op for this transport).
     */
    ping(): void;
    /**
     * Creates an instance of PipeMessageTransport.
     *
     * @param {net.Socket} socket - The underlying socket used for communication.
     */
    constructor(socket: net.Socket);
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
    onClose: () => void;
    /**
     * Event handler for when the transport connection is opened.
     *
     * @type {() => void}
     */
    onOpen: () => void;
}
