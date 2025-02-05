/**
 * Represents an error message with a timestamp.
 * 
 * @export
 * @class ErrorMessage
 */
export class ErrorMessage {
    /**
     * The error message content.
     * 
     * @type {string}
     * @memberof ErrorMessage
     */
    public message: string;

    /**
     * The timestamp when the error message was created.
     * 
     * @type {Date}
     * @memberof ErrorMessage
     */
    public timestamp: Date;

    /**
     * Creates an instance of the ErrorMessage class.
     * 
     * @param {string} message The error message content.
     * @memberof ErrorMessage
     */
    constructor(message: string) {
        this.message = message;
        this.timestamp = new Date();
    }
}
