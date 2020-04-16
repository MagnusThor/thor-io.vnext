import { TextMessage } from './TextMessage';
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
     * @type {TextMessage}
     * @memberOf PipeMessage
     */
    private message: TextMessage;
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
        this.message = JSON.parse(this.data) as TextMessage;
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
     * @returns {TextMessage}
     *
     * @memberOf PipeMessage
     */
    public toMessage(): TextMessage {
        return this.message;
    }
}
