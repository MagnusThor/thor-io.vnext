import { Message } from '../Messages/Message';
import { ITransport } from '../Interfaces/ITransport';
import { PipeMessage } from '../Messages/PipeMessage';
import * as net from 'net';
/**
 *
 *
 * @export
 * @class PipeMessageTransport
 * @implements {ITransport}
 */
export class PipeMessageTransport implements ITransport {

    static newGuid(): string {
      
      
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    /**
     *
     *
     * @type {string}
     * @memberOf PipeMessageTransport
     */
    id: string;
    /**
     *
     *
     *
     * @memberOf PipeMessageTransport
     */
    onMessage: (message: PipeMessage) => void;
    /**
     *
     *
     * @param {*} data
     *
     * @memberOf PipeMessageTransport
     */
    send(data: any) {
        let message = new PipeMessage(data, false);
        this.socket.write(message.toBuffer());
    }
    /**
     *
     *
     * @param {number} reason
     * @param {*} message
     *
     * @memberOf PipeMessageTransport
     */
    close(reason: number, message: any) {
        this.socket.destroy();
    }
    /**
     *
     *
     * @param {string} name
     * @param {Function} fn
     *
     * @memberOf PipeMessageTransport
     */
    addEventListener(name: string, fn: any) {
        this.socket.addListener(name, fn);
    }
    /**
     *
     *
     * @readonly
     * @type {number}
     * @memberOf PipeMessageTransport
     */
    get readyState(): number {
        return 1;
    }
    /**
     *
     *
     * @returns
     *
     * @memberOf PipeMessageTransport
     */
    ping() {
        return;
    }
    /**
     * Creates an instance of PipeMessageTransport.
     *
     * @param {net.Socket} socket
     *
     * @memberOf PipeMessageTransport
     */
    constructor(public socket: net.Socket) {
        this.id = PipeMessageTransport.newGuid();
        socket.addListener("data", (buffer: Buffer) => {
            let args = buffer.toString().split("|");
            let message = new Message(args[1], args[2], args[0]);
            this.onMessage(new PipeMessage(message.toString(), false));
        });
    }
}
