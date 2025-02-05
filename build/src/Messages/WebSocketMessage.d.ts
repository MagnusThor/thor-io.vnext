import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { TextMessage } from './TextMessage';
/**
 * Represents a WebSocket message, encapsulating data and its type (binary or text).
 *
 * @export
 * @class WebSocketMessage
 * @implements {ITransportMessage}
 */
export declare class WebSocketMessage implements ITransportMessage {
    data: string;
    isBinary: boolean;
    /**
     * Creates an instance of `WebSocketMessage`.
     *
     * @param {string} data - The raw message data as a string.
     * @param {boolean} isBinary - Indicates whether the message is binary.
     */
    constructor(data: string, isBinary: boolean);
    /**
     * Converts the message to a `Buffer` object.
     * **Note:** This method is not yet implemented.
     *
     * @throws {Error} Throws an error indicating that the method is not implemented.
     * @returns {Buffer}
     */
    toBuffer(): Buffer;
    /**
     * Parses the raw string data and converts it into a `TextMessage` instance.
     *
     * @returns {TextMessage} The parsed `TextMessage` object.
     */
    toMessage(): TextMessage;
}
