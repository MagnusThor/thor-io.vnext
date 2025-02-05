import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { TextMessage } from './TextMessage';
/**
 * Represents a message transported via pipes, encapsulating a `TextMessage`.
 *
 * @export
 * @class PipeMessage
 * @implements {ITransportMessage}
 */
export declare class PipeMessage implements ITransportMessage {
    data: any;
    isBinary: boolean;
    /**
     * The encapsulated `TextMessage` instance.
     *
     * @private
     * @type {TextMessage}
     */
    private message;
    /**
     * Array representation of the message components for serialization.
     *
     * @private
     * @type {Array<string>}
     */
    private arr;
    /**
     * Creates an instance of `PipeMessage`.
     *
     * @param {*} data - The raw data representing the message.
     * @param {boolean} isBinary - Indicates if the data is in binary format.
     */
    constructor(data: any, isBinary: boolean);
    /**
     * Serializes the `PipeMessage` to a `Buffer`.
     *
     * @returns {Buffer} A buffer containing the serialized message data.
     */
    toBuffer(): Buffer;
    /**
     * Converts the `PipeMessage` back to a `TextMessage` instance.
     *
     * @returns {TextMessage} The encapsulated `TextMessage`.
     */
    toMessage(): TextMessage;
}
