"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerBase = void 0;
const url_1 = require("url");
const CanInvoke_1 = require("../Decorators/CanInvoke");
const CanSet_1 = require("../Decorators/CanSet");
const ErrorMessage_1 = require("../Messages/ErrorMessage");
const TextMessage_1 = require("../Messages/TextMessage");
const Subscription_1 = require("./Subscription");
/**
 * ControllerBase
 *
 * Base class for all controllers.
 */
class ControllerBase {
    /**
     * Invokes a method on the controller.
     * @param {string} method The name of the method to invoke.
     * @param {any} data The data to pass to the method.
     * @param {Buffer} [buffer] Optional buffer data.
     */
    invokeMethod(method, data, buffer) {
        const controller = this;
        const json = JSON.parse(data);
        if (typeof controller[method] === "function") {
            controller[method].apply(controller, [
                json,
                method,
                controller.alias,
                buffer,
            ]);
        }
    }
    /**
     * Sets a property on the controller.
     * @param {string} propertyName The name of the property to set.
     * @param {any} propertyValue The value to set the property to.
     */
    setProperty(proprtyName, propertyValue) {
        const controller = this;
        if (typeof controller[proprtyName] === typeof propertyValue)
            controller[proprtyName] = propertyValue;
    }
    /**
     * Gets a property from the controller.
     * @param {string} propertyName The name of the property to get.
     * @param {string} topic The topic to use for the response.
     */
    getProperty(proprtyName, topic) {
        const propertyValue = Reflect.getOwnMetadata(proprtyName, this);
        this.invoke(propertyValue, topic);
    }
    /**
     * Gets the name of the controller.
     * @returns {string} The alias of the controller.
     */
    getName() {
        return this.alias;
    }
    /**
     * Creates a new instance of ControllerBase.
     *
     * @param {Connection} connection The connection associated with the controller.
     */
    constructor(connection) {
        this.connection = connection;
        this.subscriptions = [];
        this.alias = Reflect.getMetadata("alias", this.constructor);
        this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);
        if (this.heartbeatInterval >= 1000)
            this.enableHeartbeat();
    }
    /**
     * Enables the heartbeat mechanism.
     */
    enableHeartbeat() {
        this.connection.transport.addEventListener("pong", () => {
            this.lastPong = new Date();
        });
        this.interval = setInterval(() => {
            this.lastPing = new Date();
            if (this.connection.transport.readyState === 1)
                this.connection.transport.ping();
        }, this.heartbeatInterval);
    }
    /**
     * Disables the heartbeat mechanism.
    */
    disbaleHeartbeat() {
        clearInterval(this.interval);
    }
    /**
    * Checks if a specific method can be invoked on the controller.
    *
    * @param {string} method The name of the method.
    * @returns {boolean} True if the method can be invoked, false otherwise.
    */
    canInvokeMethod(method) {
        return Reflect.getMetadata("canInvoke", this, method);
    }
    /**
     * Checks if a specific property can be set on the controller.
     *
     * @param {string} property The name of the property.
     * @returns {boolean} True if the property can be set, false otherwise.
     */
    canSetProperty(property) {
        return Reflect.getMetadata("canSet", this, property);
    }
    /**
     * Checks if a specific property can be gotten from the controller.
     *
     * @param {string} property The name of the property.
     * @returns {boolean} True if the property can be gotten, false otherwise.
     */
    canGetProperty(property) {
        return Reflect.getMetadata("canGet", this, property);
    }
    /**
    * Finds controllers on other connections that match the given predicate.
    *
    * @template T
    * @param {string} alias The alias of the controller to find.
    * @param {Function} predicate The predicate function to filter controllers.
    * @returns {ControllerBase[] | undefined} An array of controllers that match the predicate, or undefined if no controllers were found.
    */
    findOn(alias, predicate) {
        let connections = this.getConnections(alias).map((p) => {
            return p.tryGetController(alias);
        });
        const result = connections.filter(predicate).filter((c) => c !== undefined);
        return result.length > 0 ? result : undefined;
    }
    /**
     * Gets a list of connections.
     *
     * @param {string} alias Optional alias to filter connections by.
     * @returns {Connection[]} An array of connections.
     */
    getConnections(alias) {
        if (!alias) {
            return Array.from(this.connection.connections.values());
        }
        else {
            return Array.from(this.connection.connections.values())
                .map((conn) => {
                if (conn.hasController(this.alias)) {
                    return conn;
                }
            })
                .filter((conn) => conn !== undefined);
        }
    }
    /**
     * Called when the connection is opened.
     */
    onopen() { }
    /**
     * Called when the connection is closed.
     */
    onclose() { }
    /**
   * Finds elements in an array that match a predicate and applies a selector function.
   *
   * @template T
   * @template U
   * @param {T[]} array The array to search.
   * @param {Function} predicate The predicate function to filter elements.
   * @param {Function} selector The selector function to apply to the filtered elements.
   * @returns {U[]} An array of selected elements.
   */
    find(array, predicate, selector = (x) => x) {
        return array.filter(predicate).map(selector);
    }
    /**
     * Invokes an error message.
     *
     * @param {any} ex The error object.
     */
    invokeError(ex) {
        let errorMessage = new ErrorMessage_1.ErrorMessage(ex.message);
        this.invoke(errorMessage, "___error", this.alias);
    }
    /**
     * Invokes a method on controllers on other connections.
     *
     * @param {any} data The data to send.
     * @param {string} topic The topic of the message.
     * @param {string} [controller] The optional controller alias.
     * @param {any} [buffer] Optional buffer data.
     */
    invokeToOthers(data, topic, controller, buffer) {
        this.getConnections().filter((pre) => pre.id !== this.connection.id)
            .forEach((connection) => {
            const targetController = connection.tryGetController(controller || this.alias);
            if (targetController) {
                targetController.invoke(data, topic, controller || this.alias, buffer);
            }
            else {
                // Handle the case where the controller is not found for this connection
                console.warn(`Controller '${controller || this.alias}' not found on connection '${connection.id}'`);
            }
        });
    }
    /**
     * Invokes a method on controllers on all connections.
     *
     * @param {any} data The data to send.
     * @param {string} topic The topic of the message.
     * @param {string} [controller] The optional controller alias.
     * @param {any} [buffer] Optional buffer data.
     */
    invokeToAll(data, topic, controller, buffer) {
        this.getConnections().forEach((connection) => {
            const targetController = connection.tryGetController(controller || this.alias);
            if (targetController) {
                targetController.invoke(data, topic, controller || this.alias, buffer);
            }
        });
    }
    /**
     * Invokes a method on controllers that match the given predicate.
     *
     * @param {Function} predicate The predicate function to filter controllers.
     * @param {any} data The data to send.
     * @param {string} topic The topic of the message.
     * @param {string} [controller] The optional controller alias.
     * @param {any} [buffer] Optional buffer data.
     */
    invokeTo(predicate, data, topic, controller, buffer) {
        const connections = this.findOn(controller || this.alias, predicate);
        if (connections) {
            connections.forEach((ctrl) => {
                ctrl.invoke(data, topic, controller || this.alias, buffer);
            });
        }
    }
    /**
     * Invokes a method on the current connection.
     *
     * @param {any} data The data to send.
     * @param {string} topic The topic of the message.
     * @param {string} [controller] The optional controller alias.
     * @param {Buffer} [buffer] Optional buffer data.
     * @returns {ControllerBase} The current controller instance.
     */
    invoke(data, topic, controller, buffer) {
        let msg = new TextMessage_1.TextMessage(topic, data, controller || this.alias, buffer);
        if (this.connection.transport)
            this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
        return this;
    }
    /**
     * Publishes a message to subscribers.
     *
     * @param {any} data The data to send.
     * @param {string} topic The topic of the message.
     * @param {string} [controller] The optional controller alias.
     * @returns {ControllerBase} The current controller instance.
     */
    publish(data, topic, controller) {
        if (!this.hasSubscription(topic))
            return this;
        return this.invoke(data, topic, controller || this.alias);
    }
    /**
     * Publishes a message to all connections.
     *
     * @param {any} data The data to send.
     * @param {string} topic The topic of the message.
     * @param {string} [controller] The optional controller alias.
     */
    publishToAll(data, topic, controller) {
        let msg = new TextMessage_1.TextMessage(topic, data, this.alias);
        this.getConnections().forEach((connection) => {
            let ctrl = connection.tryGetController(controller || this.alias);
            if (ctrl) {
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            }
            else {
                // Handle the case where the controller is not found for this connection
                console.warn(`Controller '${controller || this.alias}' not found on connection '${connection.id}'`);
            }
        });
    }
    /**
     * Checks if the controller has a subscription for the given topic.
     *
     * @param {string} topic The topic to check.
     * @returns {boolean} True if the controller has a subscription for the topic, false otherwise.
     */
    hasSubscription(topic) {
        /**
         *
         *
         * @param {Subscription} pre
         * @returns
         */
        let p = this.subscriptions.filter((pre) => {
            return pre.topic === topic;
        });
        return !(p.length === 0);
    }
    /**
     * Adds a subscription for the given topic.
     *
     * @param {string} topic The topic to subscribe to.
     * @returns {Subscription} The created subscription.
     */
    addSubscription(topic) {
        let subscription = new Subscription_1.Subscription(topic, this.alias);
        return this.___subscribe(subscription, topic, this.alias);
    }
    /**
     * Removes a subscription for the given topic.
     *
     * @param {string} topic The topic to unsubscribe from.
     */
    removeSubscription(topic) {
        const subscription = this.getSubscription(topic);
        if (!subscription)
            return;
        return this.___unsubscribe(subscription);
    }
    /**
     * Gets the subscription for the given topic.
     *
     * @param {string} topic The topic to find the subscription for.
     * @returns {Subscription | undefined} The subscription for the given topic, or undefined if no subscription is found.
     */
    getSubscription(topic) {
        let subscription = this.subscriptions.find((pre) => {
            return pre.topic === topic;
        });
        return subscription;
    }
    /**
     * Connects the controller.
     *
     * **Note:** This method is marked as @CanInvoke(true), but its purpose is unclear.
     * Consider reviewing and potentially removing this method.
     */
    ___connect() {
        // todo: remove this method
    }
    /**
     * Closes the connection associated with the controller.
     */
    ___close() {
        this.connection.tryRemoveControllerInstance(this.alias);
        this.invoke({}, " ___close", this.alias);
    }
    /**
     * Subscribes the controller to a specific topic.
     *
     * @param {Subscription} subscription The subscription object.
     * @param {string} topic The topic to subscribe to.
     * @param {string} controller The controller alias.
     * @returns {Subscription} The created or existing subscription.
     */
    ___subscribe(subscription, topic, controller) {
        if (this.hasSubscription(subscription.topic)) {
            return this.getSubscription(topic);
        }
        this.subscriptions.push(subscription);
        return subscription;
    }
    /**
     * Unsubscribes the controller from a specific topic.
     *
     * @param {Subscription} subscription The subscription to unsubscribe.
     * @returns {boolean} True if the subscription was successfully unsubscribed, false otherwise.
     */
    ___unsubscribe(subscription) {
        let index = this.subscriptions.indexOf(subscription);
        if (index >= 0) {
            let result = this.subscriptions.splice(index, 1);
            return true;
        }
        else
            return false;
    }
    /**
     * Gets the query parameters from the request.
     *
     * @returns {URLSearchParams} The URLSearchParams object containing the query parameters.
     */
    get queryParameters() {
        return new url_1.URLSearchParams(this.request.url.replace("/?", ""));
    }
    /**
     * Gets the headers from the request.
     *
     * @returns {Map<string, string>} A Map containing the request headers.
     */
    get headers() {
        let headers = new Map();
        try {
            Object.keys(this.connection.transport.request["headers"]).forEach(k => {
                headers.set(k, this.connection.transport.request["headers"][k]);
            });
        }
        catch (_a) {
            return headers;
        }
        return headers;
    }
    /**
     * Gets the underlying request object.
     *
     * @returns {any} The request object.
     */
    get request() {
        return this.connection.transport.request;
    }
    /**
     * Creates a new instance of the controller.
     * @param {Connection} connection The connection associated with the controller.
     * @returns {ControllerBase} The new controller instance.
     */
    instance(connection) {
        console.log(`Create a new Instance of ${this.alias} for ${connection.id}`);
        return new ControllerBase(connection);
    }
}
exports.ControllerBase = ControllerBase;
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "invokeMethod", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "setProperty", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "getProperty", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "getName", null);
__decorate([
    (0, CanSet_1.CanSetGet)(false)
], ControllerBase.prototype, "alias", void 0);
__decorate([
    (0, CanSet_1.CanSetGet)(false)
], ControllerBase.prototype, "subscriptions", void 0);
__decorate([
    (0, CanSet_1.CanSetGet)(false)
], ControllerBase.prototype, "connection", void 0);
__decorate([
    (0, CanSet_1.CanSetGet)(false)
], ControllerBase.prototype, "lastPong", void 0);
__decorate([
    (0, CanSet_1.CanSetGet)(false)
    /**
     * Timestamp of the last ping sent.
     * @type {Date | undefined}
     */
], ControllerBase.prototype, "lastPing", void 0);
__decorate([
    (0, CanSet_1.CanSetGet)(false)
], ControllerBase.prototype, "heartbeatInterval", void 0);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "enableHeartbeat", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "disbaleHeartbeat", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "canInvokeMethod", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "canSetProperty", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "canGetProperty", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "findOn", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "getConnections", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "onopen", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "onclose", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "find", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "invokeError", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "invokeToOthers", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "invokeToAll", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "invokeTo", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "invoke", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "publish", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "publishToAll", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "hasSubscription", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "addSubscription", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "removeSubscription", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(false)
], ControllerBase.prototype, "getSubscription", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], ControllerBase.prototype, "___connect", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], ControllerBase.prototype, "___close", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], ControllerBase.prototype, "___subscribe", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], ControllerBase.prototype, "___unsubscribe", null);
