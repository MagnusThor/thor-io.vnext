import { TextMessage } from "../Messages/TextMessage";

/**
 *
 *
 * @export
 * @interface ITransportMessage
 */
export interface ITransportMessage {
    /**
     *
     *
     * @returns {TextMessage}
     *
     * @memberOf ITransportMessage
     */
    toMessage(): TextMessage;
    /**
     *
     *
     * @param {TextMessage} [message]
     * @returns {Buffer}
     *
     * @memberOf ITransportMessage
     */
    toBuffer(message?: TextMessage): Buffer;
    /**
     *
     *
     * @type {boolean}
     * @memberOf ITransportMessage
     */
    binary: boolean;
    /**
     *
     *
     * @type {*}
     * @memberOf ITransportMessage
     */
    data: any;
}
