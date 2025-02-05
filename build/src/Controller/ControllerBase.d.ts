import { URLSearchParams } from 'url';
import { Connection } from '../Connection/Connection';
import { Subscription } from './Subscription';
export interface ControllerBase {
    subscriptions: Array<Subscription>;
    connection: Connection;
    disbaleHeartbeat(): void;
    canInvokeMethod(method: string): boolean;
    canSetProperty(property: string): boolean;
    canGetProperty(property: string): boolean;
    getProperty(propertyName: string, topic: string): any;
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
    instance(connection: Connection): ControllerBase;
    new (connection: Connection): ControllerBase;
}
/**
 * ControllerBase
 *
 * Base class for all controllers.
 */
export declare class ControllerBase implements ControllerBase {
    /**
     * Gets the name of the controller.
     * @returns {string} The alias of the controller.
     */
    getName(): string;
    /**
     * The alias of the controller.
     * @type {string}
     */
    alias: string;
    /**
     * An array of subscriptions for the controller.
     * @type {Array<Subscription>}
     */
    subscriptions: Array<Subscription>;
    /**
     * The connection associated with the controller.
     * @type {Connection}
     */
    connection: Connection;
    /**
     * Timestamp of the last pong received.
     * @type {Date | undefined}
     */
    private lastPong;
    /**
     * Timestamp of the last ping sent.
     * @type {Date | undefined}
     */
    private lastPing;
    /**
     * Interval for sending heartbeats.
     * @type {number}
     */
    private heartbeatInterval;
    /**
     * NodeJS.Timeout object for the heartbeat interval.
     * @type {NodeJS.Timeout | undefined}
     */
    private interval;
    /**
     * Creates a new instance of ControllerBase.
     *
     * @param {Connection} connection The connection associated with the controller.
     */
    constructor(connection: Connection);
    /**
     * Enables the heartbeat mechanism.
     */
    private enableHeartbeat;
    /**
     * Connects the controller.
     *
     * **Note:** This method is marked as @CanInvoke(true), but its purpose is unclear.
     * Consider reviewing and potentially removing this method.
     */
    ___connect(): void;
    /**
     * Closes the connection associated with the controller.
     */
    ___close(): void;
    /**
     * Subscribes the controller to a specific topic.
     *
     * @param {Subscription} subscription The subscription object.
     * @param {string} topic The topic to subscribe to.
     * @param {string} controller The controller alias.
     * @returns {Subscription} The created or existing subscription.
     */
    ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription;
    /**
     * Unsubscribes the controller from a specific topic.
     *
     * @param {Subscription} subscription The subscription to unsubscribe.
     * @returns {boolean} True if the subscription was successfully unsubscribed, false otherwise.
     */
    ___unsubscribe(subscription: Subscription): boolean;
    /**
     * Gets the query parameters from the request.
     *
     * @returns {URLSearchParams} The URLSearchParams object containing the query parameters.
     */
    get queryParameters(): URLSearchParams;
    /**
     * Gets the headers from the request.
     *
     * @returns {Map<string, string>} A Map containing the request headers.
     */
    get headers(): Map<string, string>;
    /**
     * Gets the underlying request object.
     *
     * @returns {any} The request object.
     */
    get request(): any;
}
