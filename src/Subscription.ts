/**
 *
 *
 * @export
 * @class Subscription
 */
export class Subscription {
    /**
     *
     *
     * @type {string}
     * @memberOf Subscription
     */
    public topic: string;
    /**
     *
     *
     * @type {string}
     * @memberOf Subscription
     */
    public controller: string;
    /**
     * Creates an instance of Subscription.
     *
     * @param {string} topic
     * @param {string} controller
     *
     * @memberOf Subscription
     */
    constructor(topic: string, controller: string) {
        this.topic = topic;
        this.controller = controller;
    }
}
