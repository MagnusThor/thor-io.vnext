import { BufferUtils } from '../Utils/BufferUtils';
import { StringUtils } from '../Utils/StringUtils';

/**
 * Represents a text message with optional binary data.
 *
 * @export
 * @class TextMessage
 */
export class TextMessage {
    /**
     * Binary data associated with the message (if any).
     *
     * @type {Buffer | undefined}
     */
    B: Buffer | undefined;

    /**
     * Topic of the message.
     *
     * @type {string}
     */
    T: string;

    /**
     * Data payload of the message.
     *
     * @type {any}
     */
    D: any;

    /**
     * Controller of the message.
     *
     * @type {string}
     */
    C: string;

    /**
     * Indicates whether the message contains binary data.
     *
     * @type {boolean}
     */
    isBinary: boolean = false;

    /**
     * Unique identifier for the message.
     *
     * @type {string}
     */
    I: string;

    /**
     * Indicates if this is the final message in a sequence.
     *
     * @type {boolean}
     */
    F: boolean;

    /**
     * Gets the JSON representation of the message.
     *
     * @readonly
     * @type {any}
     */
    get JSON(): any {
        return {
            T: this.T,
            D: JSON.stringify(this.D),
            C: this.C,
            I: this.I,
            F: this.F,
        };
    }

    /**
     * Creates an instance of `TextMessage`.
     *
     * @param {string} topic - Topic of the message.
     * @param {any} data - Data payload of the message.
     * @param {string} controller - Controller of the message.
     * @param {Buffer} [arrayBuffer] - Optional binary data.
     * @param {string} [uuid] - Optional unique identifier.
     * @param {boolean} [isFinal] - Indicates if this is the final message in a sequence.
     */
    constructor(topic: string, data: any, controller: string, arrayBuffer?: Buffer, uuid?: string, isFinal?: boolean) {
        this.D = data;
        this.T = topic;
        this.C = controller;
        this.B = arrayBuffer;
        this.I = uuid || StringUtils.newGuid();
        this.F = isFinal ?? true; // Default to true if not provided

        if (arrayBuffer) {
            this.isBinary = true;
        }
    }

    /**
     * Returns a string representation of the message.
     *
     * @returns {string} The JSON string representation of the message.
     */
    toString(): string {
        return JSON.stringify(this.JSON);
    }

    /**
     * Creates a `TextMessage` instance from a `Buffer`.
     *
     * @static
     * @param {Buffer} buffer - The buffer containing the message data.
     * @returns {TextMessage} The parsed `TextMessage` instance.
     */
    static fromArrayBuffer(buffer: Buffer): TextMessage {
        const headerLen = 8;
        const header = buffer.slice(0, headerLen);
        const payloadLength = BufferUtils.arrayToLong(header);
        const message = buffer.slice(headerLen, payloadLength + headerLen);
        const blobOffset = headerLen + payloadLength;
        const blob = buffer.slice(blobOffset, buffer.byteLength);
        const data = JSON.parse(message.toString()) as TextMessage;
        return new TextMessage(data.T, data.D, data.C, blob, data.I, data.F);
    }

    /**
     * Converts the `TextMessage` to a `Buffer`.
     *
     * @returns {Buffer} The buffer representation of the message.
     */
    toArrayBuffer(): Buffer {
        const messagePayload = this.toString();
        const payloadLength = messagePayload.length;
        const header = Buffer.from(BufferUtils.longToArray(payloadLength));
        const message = Buffer.from(messagePayload, 'utf-8');
        const blob = this.B ? Buffer.from(this.B) : Buffer.alloc(0); 
        return Buffer.concat([header, message, blob]);
    }
}
