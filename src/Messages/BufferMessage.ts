import { Message } from './Message';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
/**
 *
 *
 * @export
 * @class BufferMessage
 * @implements {ITransportMessage}
 */
export class BufferMessage implements ITransportMessage {
    /**
     * Creates an instance of BufferMessage.
     *
     * @param {Buffer} data
     * @param {boolean} binary
     *
     * @memberOf BufferMessage
     */
    constructor(public data: Buffer, public binary: boolean) {
    }
    /**
     *
     *
     * @returns {Message}
     *
     * @memberOf BufferMessage
     */
    toMessage(): Message {
        const headerLen = 3;
        const tLen = this.data.readUInt8(0);
        const cLen = this.data.readUInt8(1);
        const dLen = this.data.readUInt8(2);
        let offset = headerLen;
        const topic = this.data.toString("utf-8", offset, tLen + offset);
        offset += tLen;
        const controller = this.data.toString("utf-8", offset, offset + cLen);
        offset += cLen;
        const data = this.data.toString("utf-8", offset, offset + dLen);
        let message = new Message(topic, data, controller);
        return message;
    }
    /**
     *
     *
     * @returns {Buffer}
     *
     * @memberOf BufferMessage
     */
    toBuffer(): Buffer {
        let message = JSON.parse(this.data.toString()) as Message;
        const header = 3;
        let offset = 0;
        const tLen = message.T.length;
        const dLen = message.D.length;
        const cLen = message.C.length;
        let bufferSize = header + tLen + dLen + cLen;
        let buffer = new Buffer(bufferSize);
        buffer.writeUInt8(tLen, 0);
        buffer.writeUInt8(cLen, 1);
        buffer.writeInt8(dLen, 2);
        offset = header;
        buffer.write(message.T, offset);
        offset += tLen;
        buffer.write(message.C, offset);
        offset += cLen;
        buffer.write(message.D, offset);
        return buffer;
    }
}
