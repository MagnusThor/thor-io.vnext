/**
 *
 *
 * @export
 * @class Listener
 */
export class Listener {
    /**
     *
     *
     * @type {Function}
     * @memberOf Listener
     */
    fn: Function;
    /**
     *
     *
     * @type {string}
     * @memberOf Listener
     */
    topic: string;
    /**
     * Creates an instance of Listener.
     *
     * @param {string} topic
     * @param {Function} fn
     *
     * @memberOf Listener
     */
    constructor(topic: string, fn: Function) {
        this.fn = fn;
        this.topic = topic;
    }
}
