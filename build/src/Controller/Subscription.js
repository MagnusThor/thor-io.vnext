"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
/**
 * Represents a subscription to a specific topic with an associated controller.
 *
 * @export
 * @class Subscription
 */
class Subscription {
    /**
     * Creates an instance of Subscription.
     *
     * @param {string} topic - The topic of the subscription.
     * @param {string} controller - The controller associated with the subscription.
     */
    constructor(topic, controller) {
        this.topic = topic;
        this.controller = controller;
    }
}
exports.Subscription = Subscription;
