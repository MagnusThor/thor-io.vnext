/**
 *
 *
 * @export
 * @class Signal
 */
export class Signal {
    /**
     *
     *
     * @type {string}
     * @memberOf Signal
     */
    recipient: string;
    /**
     *
     *
     * @type {string}
     * @memberOf Signal
     */
    sender: string;
    /**
     *
     *
     * @type {string}
     * @memberOf Signal
     */
    message: string;
    /**
     * Creates an instance of Signal.
     *
     * @param {string} recipient
     * @param {string} sender
     * @param {string} message
     *
     * @memberOf Signal
     */
    constructor(recipient: string, sender: string, message: string) {
        this.recipient = recipient;
        this.sender = sender;
        this.message = message;
    }
}
