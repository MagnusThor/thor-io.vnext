import { Utils } from "../Utils/Utils";

/**
 *
 *
 * @export
 * @class Message
 */
export class Message {
    /**
     *
     *
     * @type {Buffer}
     * @memberOf Message
     */
    B: Buffer;
    /**
     *
     *
     * @type {string}
     * @memberOf Message
     */
    T: string;
    /**
     *
     *
     * @type {*}
     * @memberOf Message
     */
    D: any;
    /**
     *
     *
     * @type {string}
     * @memberOf Message
     */
    C: string;
    /**
     *
     *
     * @type {Boolean}
     * @memberOf Message
     */
    isBinary: Boolean;
    /**
     *
     *
     * @readonly
     * @type {*}
     * @memberOf Message
     */
    get JSON(): any {
        return {
            T: this.T,
            D: JSON.stringify(this.D),
            C: this.C
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
    constructor(topic: string, data: any, controller: string, arrayBuffer?: Buffer) {
        this.D = data;
        this.T = topic;
        this.C = controller;
        this.B = arrayBuffer;
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
     * @returns {Message}
     *
     * @memberOf Message
     */
    static fromArrayBuffer(buffer: Buffer): Message {
        let headerLen = 8;
        let header = buffer.slice(0, 8);
        let payloadLength = Utils.arrayToLong(header);
        let message = buffer.slice(headerLen, payloadLength + headerLen);
        let blobOffset = headerLen + payloadLength;
        let blob = buffer.slice(blobOffset, buffer.byteLength);
        let data = JSON.parse(message.toString());
        return new Message(data.T, data.D, data.C, blob);
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
        let header = new Buffer(Utils.longToArray(payloadLength));
        let message = new Buffer(payloadLength);
        message.write(messagePayload, 0, payloadLength, "utf-8");
        var blob = new Buffer(this.B);
        var buffer = Buffer.concat([header, message, blob]);
        return buffer;
    }
}
