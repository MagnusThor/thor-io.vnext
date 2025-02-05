/**
 * Represents a subscription to a specific topic with an associated controller.
 *
 * @export
 * @class Subscription
 */
export declare class Subscription {
    /**
     * The topic of the subscription.
     *
     * @type {string}
     */
    topic: string;
    /**
     * The controller associated with the subscription.
     *
     * @type {string}
     */
    controller: string;
    /**
     * Creates an instance of Subscription.
     *
     * @param {string} topic - The topic of the subscription.
     * @param {string} controller - The controller associated with the subscription.
     */
    constructor(topic: string, controller: string);
}
