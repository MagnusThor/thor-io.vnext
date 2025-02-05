/**
 * Represents a subscription to a specific topic with an associated controller.
 *
 * @export
 * @class Subscription
 */
export class Subscription {
    /**
     * The topic of the subscription.
     *
     * @type {string}
     */
    public topic: string;

    /**
     * The controller associated with the subscription.
     *
     * @type {string}
     */
    public controller: string;

    /**
     * Creates an instance of Subscription.
     *
     * @param {string} topic - The topic of the subscription.
     * @param {string} controller - The controller associated with the subscription.
     */
    constructor(topic: string, controller: string) {
        this.topic = topic;
        this.controller = controller;
    }
}
