import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { TextMessage } from './TextMessage';
/**
 *
 *
 * @export
 * @class BufferMessage
 * @implements {ITransportMessage}
 */
export declare class BufferMessage implements ITransportMessage {
    data: Buffer;
    isBinary: boolean;
    /**
     * Creates an instance of BufferMessage.
     *
     * @param {Buffer} data
     * @param {boolean} isBinary
     *
     * @memberOf BufferMessage
     */
    constructor(data: Buffer, isBinary: boolean);
    /**
     *
     *
     * @returns {TextMessage}
     *
     * @memberOf BufferMessage
     */
    toMessage(): TextMessage;
    /**
     *
     *
     * @returns {Buffer}
     *
     * @memberOf BufferMessage
     */
    toBuffer(): Buffer;
}
