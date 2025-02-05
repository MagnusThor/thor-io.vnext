"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessage = void 0;
/**
 * Represents an error message with a timestamp.
 *
 * @export
 * @class ErrorMessage
 */
class ErrorMessage {
    /**
     * Creates an instance of the ErrorMessage class.
     *
     * @param {string} message The error message content.
     * @memberof ErrorMessage
     */
    constructor(message) {
        this.message = message;
        this.timestamp = new Date();
    }
}
exports.ErrorMessage = ErrorMessage;
