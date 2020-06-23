import * as net from 'net';
import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { BufferMessage } from '../Messages/BufferMessage';
import { StringUtils } from '../Utils/StringUtils';
import { IInterceptor } from '../Interfaces/IInterceptor';
import { IncomingMessage } from 'http';
/**
 *
 *
 * @export
 * @class BufferMessageTransport
 * @implements {ITransport}
 */
export class BufferMessageTransport implements ITransport {
 
    /**
     *
     *
     * @type {string}
     * @memberOf BufferMessageTransport
     */
    id: string;
    /**
     *
     *
     *
     * @memberOf BufferMessageTransport
     */
    onMessage: (messsage: ITransportMessage) => void;
    /**
     * Creates an instance of BufferMessageTransport.
     *
     * @param {net.Socket} socket
     *
     * @memberOf BufferMessageTransport
     */
    constructor(public socket: net.Socket) {
        this.id = StringUtils.newGuid();
        this.socket.addListener("data", (buffer: Buffer) => {
            let bm = new BufferMessage(buffer, false);
            this.onMessage(bm);
        });
    }
    request: IncomingMessage | any;
    interceptors: Map<string, IInterceptor>;
    onClose: () => void;
    onOpen: () => void;
    /**
     *
     *
     * @readonly
     *
     * @memberOf BufferMessageTransport
     */
    get readyState() {
        return 1;
    }
    /**
     *
     *
     * @param {string} data
     *
     * @memberOf BufferMessageTransport
     */
    send(data: string) {
        let bm = new BufferMessage(new Buffer(data), false);
        this.socket.write(bm.toBuffer());
    }
    /**
     *
     *
     * @param {string} name
     * @param {Function} fn
     *
     * @memberOf BufferMessageTransport
     */
    addEventListener(name: string, fn: any) {
        this.socket.addListener(name, fn);
    }
    /**
     *
     *
     * @returns
     *
     * @memberOf BufferMessageTransport
     */
    ping() {
        return;
    }
    /**
     *
     *
     *
     * @memberOf BufferMessageTransport
     */
    close() {
        this.socket.destroy();
    }
}
