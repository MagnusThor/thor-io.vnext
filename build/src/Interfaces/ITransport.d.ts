import { IncomingMessage } from 'http';
import { ITransportMessage } from './ITransportMessage';
/**
 * Represents a transport interface for handling communication over various protocols.
 * This could be used for WebSocket, HTTP, or any other transport mechanism.
 *
 * @export
 * @interface ITransport
 */
export interface ITransport {
    /**
     * A unique identifier for the transport instance.
     *
     * @type {string}
     * @memberOf ITransport
     */
    id: string;
    /**
     * The underlying socket or connection object used for communication.
     *
     * @type {*}
     * @memberOf ITransport
     */
    socket: any;
    /**
     * The current state of the connection (e.g., open, closed, etc.).
     * This is commonly used in WebSockets but can be adapted for other transport mechanisms.
     *
     * @readonly
     * @type {number}
     * @memberOf ITransport
     */
    readyState: number;
    /**
     * Sends data over the transport connection.
     *
     * @param {any} data The data to send. It can be any type, depending on the transport.
     * @memberOf ITransport
     */
    send(data: any): void;
    /**
     * Closes the connection with a specified reason and optional message.
     *
     * @param {number} reason The reason code for closing the connection.
     * @param {any} message An optional message to include with the close operation.
     * @memberOf ITransport
     */
    close(reason: number, message: any): void;
    /**
     * Adds an event listener to the transport, e.g., for handling incoming messages or state changes.
     *
     * @param {string} topic The event name or topic to listen for.
     * @param {Function} fn The callback function to invoke when the event occurs.
     * @memberOf ITransport
     */
    addEventListener(topic: string, fn: Function): void;
    /**
     * Sends a ping message to keep the connection alive or check its status.
     *
     * @memberOf ITransport
     */
    ping(): void;
    /**
     * Callback function that is invoked when a message is received.
     * This function is optional and can be defined by the implementing class.
     *
     * @type {(message: ITransportMessage) => void}
     * @memberOf ITransport
     */
    onMessage?: (message: ITransportMessage) => void;
    /**
     * Callback function that is invoked when the connection is closed.
     * This function is optional and can be defined by the implementing class.
     *
     * @type {(e: any) => void}
     * @memberOf ITransport
     */
    onClose?: (e: any) => void;
    /**
     * Callback function that is invoked when the connection is established or opened.
     * This function is optional and can be defined by the implementing class.
     *
     * @type {(e: any) => void}
     * @memberOf ITransport
     */
    onOpen?: (e: any) => void;
    /**
     * The initial HTTP request (if applicable) associated with the transport connection.
     *
     * @type {IncomingMessage | any}
     * @memberOf ITransport
     */
    request: IncomingMessage | any;
}
