import { Message } from './Message';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
/**
 *
 *
 * @export
 * @class PipeMessage
 * @implements {ITransportMessage}
 */
export class PipeMessage implements ITransportMessage {
    /**
     *
     *
     * @private
     * @type {Message}
     * @memberOf PipeMessage
     */
    private message: Message;
    /**
     *
     *
     * @private
     * @type {Array<string>}
     * @memberOf PipeMessage
     */
    private arr: Array<string>;
    /**
     * Creates an instance of PipeMessage.
     *
     * @param {*} data
     * @param {boolean} binary
     *
     * @memberOf PipeMessage
     */
    constructor(public data: any, public binary: boolean) {
        this.message = JSON.parse(this.data) as Message;
        this.arr = new Array<string>();
        this.arr.push(this.message.C);
        this.arr.push(this.message.T);
        this.arr.push(this.message.D);
    }
    /**
     *
     *
     * @returns
     *
     * @memberOf PipeMessage
     */
    toBuffer() {
        return new Buffer(this.arr.join("|"));
    }
    /**
     *
     *
     * @returns {Message}
     *
     * @memberOf PipeMessage
     */
    public toMessage(): Message {
        return this.message;
    }
}
