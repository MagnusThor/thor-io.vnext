import { BufferUtils } from '../Utils/BufferUtils';
import { Utils } from 'thor-io.client-vnext';
/**
 *
 *
 * @export
 * @class Message
 */
export class TextMessage {
    B: Buffer;
    T: string;
    D: any;
    C: string;
    isBinary: Boolean;
    I:string;
    F: boolean
    get JSON(): any {
        return {
            T: this.T,
            D: JSON.stringify(this.D),
            C: this.C,
            I: this.I,
            F: this.F
        };
    }
    ;
    /**
     * Creates an instance of Message.
     *
     * @param {string} topic
     * @param {string} data
     * @param {string} controller
     * @param {Buffer} [arrayBuffer]
     *
     * @memberOf Message
     */
    constructor(topic: string, data: any, controller: string, arrayBuffer?: Buffer,uuid?:string,isFinal?:boolean) {
        this.D = data;
        this.T = topic;
        this.C = controller;
        this.B = arrayBuffer;
        this.I = uuid || Utils.newGuid();
        this.F = true;
        if (arrayBuffer)
            this.isBinary = true;
    }
    /**
     *
     *
     * @returns
     *
     * @memberOf Message
     */
    toString() {
        return JSON.stringify(this.JSON);
    }
    /**
     *
     *
     * @static
     * @param {Buffer} buffer
     * @returns {TextMessage}
     *
     * @memberOf Message
     */
    static fromArrayBuffer(buffer: Buffer): TextMessage {
        let headerLen = 8;
        let header = buffer.slice(0, 8);
        let payloadLength = BufferUtils.arrayToLong(header);
        let message = buffer.slice(headerLen, payloadLength + headerLen);
        let blobOffset = headerLen + payloadLength;
        let blob = buffer.slice(blobOffset, buffer.byteLength);
        let data = JSON.parse(message.toString()) as TextMessage
        return new TextMessage(data.T, data.D, data.C, blob,data.I,data.F);
    }
    /**
     *
     *
     * @returns {Buffer}
     *
     * @memberOf Message
     */
    toArrayBuffer(): Buffer {
        let messagePayload = this.toString();
        let payloadLength = messagePayload.length;
        let header = new Buffer(BufferUtils.longToArray(payloadLength));
        let message = new Buffer(payloadLength);
        message.write(messagePayload, 0, payloadLength, "utf-8");
        var blob = new Buffer(this.B);
        var buffer = Buffer.concat([header, message, blob]);
        return buffer;
    }
}
