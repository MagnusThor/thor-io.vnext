import { TextMessage } from './TextMessage';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
/**
 *
 *
 * @export
 * @class WebSocketMessage
 * @implements {ITransportMessage}
 */
export class WebSocketMessage implements ITransportMessage {
    /**
     * Creates an instance of WebSocketMessage.
     *
     * @param {string} data
     * @param {any} binary
     *
     * @memberOf WebSocketMessage
     */
    constructor(public data: string, public binary) {
    }
    /**
     *
     *
     * @returns {Buffer}
     *
     * @memberOf WebSocketMessage
     */
    toBuffer(): Buffer {
        throw "not yet implemented";
    }
    /**
     *
     *
     * @returns {TextMessage}
     *
     * @memberOf WebSocketMessage
     */
    toMessage(): TextMessage {
        return JSON.parse(this.data) as TextMessage;
    }
}
