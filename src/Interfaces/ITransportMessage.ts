import { TextMessage } from '../Messages/TextMessage';

/**
 * Represents a message that can be transported and converted to/from different formats.
 *
 * @export
 * @interface ITransportMessage
 */
export interface ITransportMessage {
    /**
     * Converts the transport message into a `TextMessage` instance.
     *
     * @returns {TextMessage} The corresponding `TextMessage` object.
     * @memberOf ITransportMessage
     */
    toMessage(): TextMessage;

    /**
     * Serializes the message into a `Buffer` format. Optionally accepts a `TextMessage` 
     * if the conversion needs to be done on a different message.
     *
     * @param {TextMessage} [message] The `TextMessage` to convert into a `Buffer`. 
     *                                 If not provided, defaults to the current `data`.
     * @returns {Buffer} A `Buffer` containing the serialized message data.
     * @memberOf ITransportMessage
     */
    toBuffer(message?: TextMessage): Buffer;

    /**
     * A flag indicating whether the message contains binary data.
     *
     * @type {boolean}
     * @memberOf ITransportMessage
     */
    isBinary: boolean;

    /**
     * The raw data associated with the transport message. This can be in various formats 
     * such as strings, buffers, etc.
     *
     * @type {*}
     * @memberOf ITransportMessage
     */
    data: any;
}
