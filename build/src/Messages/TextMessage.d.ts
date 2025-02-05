/**
 * Represents a text message with optional binary data.
 *
 * @export
 * @class TextMessage
 */
export declare class TextMessage {
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
    isBinary: boolean;
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
    get JSON(): any;
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
    constructor(topic: string, data: any, controller: string, arrayBuffer?: Buffer, uuid?: string, isFinal?: boolean);
    /**
     * Returns a string representation of the message.
     *
     * @returns {string} The JSON string representation of the message.
     */
    toString(): string;
    /**
     * Creates a `TextMessage` instance from a `Buffer`.
     *
     * @static
     * @param {Buffer} buffer - The buffer containing the message data.
     * @returns {TextMessage} The parsed `TextMessage` instance.
     */
    static fromArrayBuffer(buffer: Buffer): TextMessage;
    /**
     * Converts the `TextMessage` to a `Buffer`.
     *
     * @returns {Buffer} The buffer representation of the message.
     */
    toArrayBuffer(): Buffer;
}
