import { URLSearchParams } from 'url';

import { Connection } from '../Connection/Connection';
import { CanInvoke } from '../Decorators/CanInvoke';
import { CanSetGet } from '../Decorators/CanSet';
import { ErrorMessage } from '../Messages/ErrorMessage';
import { TextMessage } from '../Messages/TextMessage';
import { Subscription } from './Subscription';

export interface ControllerBase {
  
    subscriptions: Array<Subscription>;
    connection: Connection;
    disbaleHeartbeat(): void;
    canInvokeMethod(method: string): boolean;
    canSetProperty(property: string): boolean;
    canGetProperty(property: string): boolean; 
    getProperty(propertyName:string,topic:string):any
    setProperty(propertyName: string, propertyValue: any): void;
    invokeError(ex: any): void;
    invokeMethod(method: string, data: any, buffer?: Buffer): void;
    findOn<T>(alias: string, predicate: (item: any) => boolean): ControllerBase[] | undefined;
    getConnections(alias?: string): Connection[];
    onopen(): void;
    onclose(): void;
    find<T, U>(array: T[], predicate: (item: any) => boolean, selector?: (item: T) => U): U[];
    invokeToOthers(data: any, topic: string, controller?: string, buffer?: Buffer): void;
    invokeToAll(data: any, topic: string, controller?: string, buffer?: Buffer): void;
    invokeTo<T>(predicate: (item: T) => boolean, data: any, topic: string, controller?: string, buffer?: Buffer): void;
    invoke(data: any, topic: string, controller?: string, buffer?: Buffer): ControllerBase;
    publish(data: any, topic: string, controller?: string): ControllerBase;
    publishToAll(data: any, topic: string, controller?: string): void;
    hasSubscription(topic: string): boolean;
    addSubscription(topic: string): Subscription;
    removeSubscription(topic: string): void;
    getSubscription(topic: string): Subscription | undefined;
    instance(connection:Connection):ControllerBase
    new(connection: Connection): ControllerBase;
}


/**
 * ControllerBase 
 *
 * Base class for all controllers.
 */
export class ControllerBase implements ControllerBase {

    /**
     * Invokes a method on the controller.
     * @param {string} method The name of the method to invoke.
     * @param {any} data The data to pass to the method.
     * @param {Buffer} [buffer] Optional buffer data.
     */
    @CanInvoke(false)
     invokeMethod(method:string,data:any,buffer?:Buffer):void{
        const controller = this as any;
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
    @CanInvoke(false)
    setProperty(proprtyName:string,propertyValue:any):void{
        const controller = this as any;
        if (typeof controller[proprtyName] === typeof propertyValue)
            controller[proprtyName] = propertyValue;
    }

    /**
     * Gets a property from the controller.
     * @param {string} propertyName The name of the property to get.
     * @param {string} topic The topic to use for the response.
     */
    @CanInvoke(false)
    getProperty(proprtyName:string,topic:string):void{
        const propertyValue =  Reflect.getOwnMetadata(proprtyName, this)
        
        this.invoke(propertyValue,topic);

    }


    /**
     * Gets the name of the controller.
     * @returns {string} The alias of the controller.
     */
    @CanInvoke(false)
    public getName(){
        return this.alias;
    }
    /**
     * The alias of the controller.
     * @type {string}
     */
    @CanSetGet(false)
    public alias: string;
    /**
     * An array of subscriptions for the controller.
     * @type {Array<Subscription>}
     */
    @CanSetGet(false)
    public subscriptions: Array<Subscription>;
    /**
     * The connection associated with the controller.
     * @type {Connection}
     */
    @CanSetGet(false)
    public connection: Connection;
    /**
     * Timestamp of the last pong received.
     * @type {Date | undefined}
     */
    @CanSetGet(false)
    private lastPong: Date | undefined;

    @CanSetGet(false)
    /**
     * Timestamp of the last ping sent.
     * @type {Date | undefined}
     */
    private lastPing: Date | undefined;
    /**
     * Interval for sending heartbeats.
     * @type {number}
     */
    @CanSetGet(false)
    private heartbeatInterval: number;

    /**
     * NodeJS.Timeout object for the heartbeat interval.
     * @type {NodeJS.Timeout | undefined}
     */
    private interval: NodeJS.Timeout | undefined;

    /**
     * Creates a new instance of ControllerBase.
     *
     * @param {Connection} connection The connection associated with the controller.
     */
    constructor(connection: Connection) {
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
    @CanInvoke(false)
    private enableHeartbeat() {
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
    @CanInvoke(false)
    public disbaleHeartbeat(): void {
        clearInterval(this.interval!);
    }

    /**
    * Checks if a specific method can be invoked on the controller.
    *
    * @param {string} method The name of the method.
    * @returns {boolean} True if the method can be invoked, false otherwise.
    */
    @CanInvoke(false)
    public canInvokeMethod(method: string): boolean {
        return Reflect.getMetadata("canInvoke", this, method);
    }
    
    /**
     * Checks if a specific property can be set on the controller.
     *
     * @param {string} property The name of the property.
     * @returns {boolean} True if the property can be set, false otherwise.
     */
    @CanInvoke(false)
    public canSetProperty(property: string): boolean {
        return Reflect.getMetadata("canSet", this, property);
    }
    /**
     * Checks if a specific property can be gotten from the controller.
     *
     * @param {string} property The name of the property.
     * @returns {boolean} True if the property can be gotten, false otherwise.
     */
    @CanInvoke(false)
    public canGetProperty(property: string): boolean {
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
    @CanInvoke(false)
    findOn<T>(alias: string, predicate: (item: any) => boolean): ControllerBase[] | undefined {
        let connections = this.getConnections(alias).map((p: Connection) => {
            return p.tryGetController(alias);
        });
        const result = connections.filter(predicate).filter((c): c is ControllerBase => c !== undefined);
        return result.length > 0 ? result : undefined;
    }
    /**
     * Gets a list of connections.
     *
     * @param {string} alias Optional alias to filter connections by.
     * @returns {Connection[]} An array of connections.
     */
    @CanInvoke(false)
    getConnections(alias?: string): Connection[] {
        if (!alias) {
            return Array.from(this.connection.connections.values());
        } else {
            return Array.from(this.connection.connections.values())
                .map((conn: Connection) => {
                    if (conn.hasController(this.alias)) {
                        return conn;
                    }
                })
                .filter((conn): conn is Connection => conn !== undefined);
        }
    }
    /**
     * Called when the connection is opened.
     */
    @CanInvoke(false)
    onopen() { }
    /**
     * Called when the connection is closed.
     */
    @CanInvoke(false)
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
    @CanInvoke(false)
    find<T, U>(array: T[], predicate: (item: any) => boolean, selector: (item: T) => U = (x: T) => <U><any>x): U[] {
        return array.filter(predicate).map(selector);
    }
    /**
     * Invokes an error message.
     *
     * @param {any} ex The error object.
     */
    @CanInvoke(false)
    invokeError(ex: any) {
        let errorMessage = new ErrorMessage(ex.message);
       
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
    @CanInvoke(false)
    invokeToOthers(data: any, topic: string, controller?: string, buffer?: any) {
        this.getConnections().filter((pre: Connection) => pre.id !== this.connection.id)
            .forEach((connection: Connection) => {
                const targetController = connection.tryGetController(controller || this.alias);
                if (targetController) {
                    targetController.invoke(data, topic, controller || this.alias, buffer);
                } else {
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
    @CanInvoke(false)
    invokeToAll(data: any, topic: string, controller?: string, buffer?: any) {
        this.getConnections().forEach((connection: Connection) => {
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
    @CanInvoke(false)
    invokeTo<T>(predicate: (item: T) => boolean, data: any, topic: string, controller?: string, buffer?: Buffer) {
        const connections = this.findOn<ControllerBase>(controller || this.alias, predicate);
        if (connections) {
            connections.forEach((ctrl: ControllerBase) => {
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
    @CanInvoke(false)
    invoke(data: any, topic: string, controller?: string, buffer?: Buffer): ControllerBase {
        let msg = new TextMessage(topic, data, controller || this.alias, buffer);
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
    @CanInvoke(false)
    publish(data: any, topic: string, controller?: string): ControllerBase {
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
    @CanInvoke(false)
    publishToAll(data: any, topic: string, controller?: string) {
        let msg = new TextMessage(topic, data, this.alias);
        this.getConnections().forEach((connection: Connection) => {
            let ctrl = connection.tryGetController(controller || this.alias);
            if (ctrl) {
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            } else {
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
    @CanInvoke(false)
    hasSubscription(topic: string): boolean {
        /**
         *
         *
         * @param {Subscription} pre
         * @returns
         */
        let p = this.subscriptions.filter((pre: Subscription) => {
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
    @CanInvoke(false)
    addSubscription(topic: string): Subscription {
        let subscription = new Subscription(topic, this.alias);
        return this.___subscribe(subscription, topic, this.alias);
    }

    /**
     * Removes a subscription for the given topic.
     *
     * @param {string} topic The topic to unsubscribe from.
     */
    @CanInvoke(false)
    removeSubscription(topic: string) {

        const subscription = this.getSubscription(topic);
        if (!subscription) return;
        return this.___unsubscribe(subscription);
    }

    /**
     * Gets the subscription for the given topic.
     *
     * @param {string} topic The topic to find the subscription for.
     * @returns {Subscription | undefined} The subscription for the given topic, or undefined if no subscription is found.
     */
    @CanInvoke(false)
    getSubscription(topic: string): Subscription | undefined {
        let subscription = this.subscriptions.find((pre: Subscription) => {
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
    @CanInvoke(true)
    ___connect() {
        // todo: remove this method
    }

    /**
     * Closes the connection associated with the controller.
     */
    @CanInvoke(true)
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

    @CanInvoke(true)
    ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription {
        if (this.hasSubscription(subscription.topic)) {
            return this.getSubscription(topic)!;
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
    @CanInvoke(true)
    ___unsubscribe(subscription: Subscription): boolean {
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
    get queryParameters(): URLSearchParams {
        return new URLSearchParams(this.request.url.replace("/?", ""));
    }
    /**
     * Gets the headers from the request.
     *
     * @returns {Map<string, string>} A Map containing the request headers.
     */
    get headers(): Map<string, string> {
        let headers = new Map<string, any>();
        try {
            Object.keys(this.connection.transport.request["headers"]).forEach(k => {
                headers.set(k, this.connection.transport.request["headers"][k]);
            });

        } catch {
            return headers;
        }
        return headers;
    }

    /**
     * Gets the underlying request object.
     *
     * @returns {any} The request object.
     */
    get request(): any {
        return this.connection.transport.request;
    }
    
    /**
     * Creates a new instance of the controller.
     * @param {Connection} connection The connection associated with the controller.
     * @returns {ControllerBase} The new controller instance.
     */
    instance(connection:Connection): ControllerBase{
        console.log(`Create a new Instance of ${this.alias!} for ${connection.id}`);
        return new ControllerBase(connection);
    }
    // new(connection: Connection): ControllerBase{
    //     return new ControllerBase(connection)
    // }
}
