import { Message } from "../Messages/Message";

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
     * @returns {Message}
     *
     * @memberOf ITransportMessage
     */
    toMessage(): Message;
    /**
     *
     *
     * @param {Message} [message]
     * @returns {Buffer}
     *
     * @memberOf ITransportMessage
     */
    toBuffer(message?: Message): Buffer;
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
