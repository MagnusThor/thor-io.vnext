import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { TextMessage } from './TextMessage';

/**
 * Represents a message transported via pipes, encapsulating a `TextMessage`.
 *
 * @export
 * @class PipeMessage
 * @implements {ITransportMessage}
 */
export class PipeMessage implements ITransportMessage {
    /**
     * The encapsulated `TextMessage` instance.
     *
     * @private
     * @type {TextMessage}
     */
    private message: TextMessage;

    /**
     * Array representation of the message components for serialization.
     *
     * @private
     * @type {Array<string>}
     */
    private arr: Array<string>;

    /**
     * Creates an instance of `PipeMessage`.
     *
     * @param {*} data - The raw data representing the message.
     * @param {boolean} isBinary - Indicates if the data is in binary format.
     */
    constructor(public data: any, public isBinary: boolean) {
        this.message = JSON.parse(data) as TextMessage;
        this.arr = [this.message.C, this.message.T, this.message.D];
    }

    /**
     * Serializes the `PipeMessage` to a `Buffer`.
     *
     * @returns {Buffer} A buffer containing the serialized message data.
     */
    toBuffer(): Buffer {
        return Buffer.from(this.arr.join("|"), 'utf-8');
    }

    /**
     * Converts the `PipeMessage` back to a `TextMessage` instance.
     *
     * @returns {TextMessage} The encapsulated `TextMessage`.
     */
    public toMessage(): TextMessage {
        return this.message;
    }
}
