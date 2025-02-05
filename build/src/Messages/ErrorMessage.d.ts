/**
 * Represents an error message with a timestamp.
 *
 * @export
 * @class ErrorMessage
 */
export declare class ErrorMessage {
    /**
     * The error message content.
     *
     * @type {string}
     * @memberof ErrorMessage
     */
    message: string;
    /**
     * The timestamp when the error message was created.
     *
     * @type {Date}
     * @memberof ErrorMessage
     */
    timestamp: Date;
    /**
     * Creates an instance of the ErrorMessage class.
     *
     * @param {string} message The error message content.
     * @memberof ErrorMessage
     */
    constructor(message: string);
}
