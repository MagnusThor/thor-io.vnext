import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { WebSocketMessage } from '../Messages/WebSocketMessage';
import { StringUtils } from '../Utils/StringUtils';

/**
 *
 *
 * @export
 * @class WebSocketMessageTransport
 * @implements {ITransport}
 */
export class WebSocketMessageTransport implements ITransport {
 
    /**
     *
     *
     * @type {WebSocket}
     * @memberOf WebSocketMessageTransport
     */
    socket: WebSocket;
    /**
     *
     *
     *
     * @memberOf WebSocketMessageTransport
     */
    onMessage: (message: ITransportMessage) => void;
    ;
    /**
     *
     *
     * @type {string}
     * @memberOf WebSocketMessageTransport
     */
    id: string;
    /**
     *
     *
     * @param {*} data
     *
     * @memberOf WebSocketMessageTransport
     */
    send(data: any) {
        this.socket.send(data);
    }
    /**
     *
     *
     * @param {number} reason
     * @param {string} message
     *
     * @memberOf WebSocketMessageTransport
     */
    close(reason: number, message: string) {
        this.socket.close(reason, message);
    }
    /**
     *
     *
     * @param {string} name
     * @param {*} fn
     *
     * @memberOf WebSocketMessageTransport
     */
    addEventListener(name: string, fn: any) {
        this.socket.addEventListener(name, fn);
    }

    
    /**
     * Creates an instance of WebSocketMessageTransport.
     *
     * @param {*} socket
     *
     * @memberOf WebSocketMessageTransport
     */
    constructor(socket: any) {
        this.id = StringUtils.newGuid();
        this.socket = socket;
        this.socket.addEventListener("message", (event: any) => {
            this.onMessage(new WebSocketMessage(event.data, typeof(event.data) != "string" ));
        });
    }
    /**
     *
     *
     * @readonly
     *
     * @memberOf WebSocketMessageTransport
     */
    get readyState() {
        return this.socket.readyState;
    }
    /**
     *
     *
     *
     * @memberOf WebSocketMessageTransport
     */
    ping() {
        this.socket["ping"]();
    }
}
