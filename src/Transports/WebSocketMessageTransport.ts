import { IncomingMessage } from 'http';

import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { WebSocketMessage } from '../Messages/WebSocketMessage';
import { StringUtils } from '../Utils/StringUtils';

/**
 * A transport class for handling WebSocket communication and converting messages 
 * to/from the `WebSocketMessage` format.
 *
 * @export
 * @class WebSocketMessageTransport
 * @implements {ITransport}
 */
export class WebSocketMessageTransport implements ITransport {
    /**
     * The HTTP request associated with the WebSocket connection.
     *
     * @type {IncomingMessage | Request}
     */
    request: IncomingMessage | Request;

    /**
     * The WebSocket instance used for communication.
     *
     * @type {WebSocket}
     */
    socket: WebSocket;

    /**
     * Callback for handling incoming messages. Defaults to creating a `WebSocketMessage`.
     *
     * @type {(message: ITransportMessage) => void}
     */
    onMessage: (message: ITransportMessage) => void = (message) => {
        // Default implementation
    };

    /**
     * Sends data through the WebSocket connection.
     *
     * @param {any} data - The data to be sent.
     */
    send(data: any) {
        this.socket.send(data);
    }

    /**
     * Closes the WebSocket connection.
     *
     * @param {number} reason - The reason code for closing the connection.
     * @param {string} message - Optional message providing details about the closure.
     */
    close(reason: number, message: string) {
        this.socket.close(reason, message);
    }

    /**
     * Adds an event listener to the WebSocket instance.
     *
     * @param {string} name - The event name.
     * @param {Function} fn - The callback function to execute when the event occurs.
     */
    addEventListener(name: string, fn: any) {
        this.socket.addEventListener(name, fn);
    }

    /**
     * Creates an instance of `WebSocketMessageTransport`.
     *
     * @param {WebSocket} socket - The WebSocket object to use for communication.
     * @param {IncomingMessage} req - The initial HTTP request associated with the connection.
     */
    constructor(socket: WebSocket, req: IncomingMessage) {
        this.id = StringUtils.newGuid();
        this.request = req;
        this.socket = socket;
        this.socket.addEventListener("message", (event: MessageEvent) => {
            this.onMessage(new WebSocketMessage(event.data, typeof event.data !== "string"));
        });
    }

    /**
     * Unique identifier for this transport instance.
     *
     * @type {string}
     */
    id: string;

    /**
     * Callback for handling the WebSocket `close` event.
     *
     * @type {(ev: CloseEvent) => void}
     */
    onClose: (ev: CloseEvent) => void = (ev: CloseEvent) => { };

    /**
     * Callback for handling the WebSocket `open` event.
     *
     * @type {(ev: Event) => void}
     */
    onOpen: (ev: Event) => void = (ev: Event) => { };

    /**
     * The current ready state of the WebSocket connection.
     *
     * @readonly
     * @type {number}
     */
    get readyState() {
        return this.socket.readyState;
    }

    /**
     * Sends a ping message to maintain the connection or test latency.
     */
    ping() {
        // Assumes the WebSocket implementation supports ping.
        (this.socket as any).ping?.();
    }
}
