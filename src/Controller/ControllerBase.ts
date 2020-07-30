import { CanInvoke } from '../Decorators/CanInvoke';
import { CanSet } from '../Decorators/CanSet';
import { TextMessage } from '../Messages/TextMessage';

import { Subscription } from '../Subscription';
import { ErrorMessage } from '../Messages/ErrorMessage';
import { URLSearchParams } from 'url';
import { Connection } from '../Connection/Connection';

export interface ControllerBase {
    new(connection: Connection): ControllerBase;
}
export class ControllerBase {
    /**
     *
     *
     * @type {string}
     * @memberOf Controller
     */
    @CanSet(false)
    public alias: string;
    /**
     *
     *
     * @type {Array<Subscription>}
     * @memberOf Controller
     */
    @CanSet(false)
    public subscriptions: Array<Subscription>;
    /**
     *
     *
     * @type {Connection}
     * @memberOf Controller
     */
    @CanSet(false)
    public connection: Connection;
    /**
     *
     *
     * @private
     * @type {Date}
     * @memberOf Controller
     */
    @CanSet(false)
    private lastPong: Date;
    /**
     *
     *
     * @private
     * @type {Date}
     * @memberOf Controller
     */
    @CanSet(false)
    private lastPing: Date;
    /**
     *
     *
     * @private
     * @type {number}
     * @memberOf Controller
     */
    @CanSet(false)
    private heartbeatInterval: number;
    private interval: NodeJS.Timeout;
    /**
     * Creates an instance of Controller.
     *
     * @param {Connection} connection
     *
     * @memberOf Controller
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
     *
     *
     * @private
     *
     * @memberOf Controller
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
    @CanInvoke(false)
    public disbaleHeartbeat(): void {
        clearInterval(this.interval);
    }
    /**
     *
     *
     * @param {string} method
     * @returns {boolean}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    public canInvokeMethod(method: string): boolean {
        return Reflect.getMetadata("canInvokeOrSet", this, method);
    }
    /**
     *
     *
     * @template T
     * @param {string} alias
     * @param {(item: any) => boolean} predicate
     * @returns {Array<any>}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    findOn<T>(alias: string, predicate: (item: any) => boolean): Array<ControllerBase> {
        /**
         *
         *
         * @param {Connection} p
         * @returns
         */
        let connections = this.getConnections(alias).map((p: Connection) => {
            return p.getController(alias);
        });
        return connections.filter(predicate);
    }
    /**
     *
     *
     * @param {string} [alias]
     * @returns {Array<Connection>}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    getConnections(alias?: string): Array<Connection> {
        if (!alias) {
            return Array.from(this.connection.connections.values());
        }
        else {
            return Array.from(this.connection.connections.values()).map((conn: Connection) => {
                if (conn.hasController(this.alias))
                    return conn;
            });
        }
    }
    /**
     *
     *
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    onopen() { }
    /**
     *
     *
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    onclose() { }
    /**
     *
     *
     * @template T
     * @template U
     * @param {T[]} array
     * @param {(item: any) => boolean} predicate
     * @param {(item: T) => U} [selector=(x: T) => <U><any>x]
     * @returns {U[]}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    find<T, U>(array: T[], predicate: (item: any) => boolean, selector: (item: T) => U = (x: T) => <U><any>x): U[] {
        return array.filter(predicate).map(selector);
    }
    /**
     *
     *
     * @param {*} error
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    invokeError(ex: any) {
        let errorMessage = new ErrorMessage(ex.message);
        this.invoke(errorMessage, "___error", this.alias);
    }
    /**
     *
     *
     * @param {*} data
     * @param {string} topic
     * @param {string} [controller]
     * @param {*} [buffer]
     * @returns {ControllerBase}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    invokeToOthers(data: any, topic: string, controller?: string, buffer?: any) {
        this.getConnections().filter((pre: Connection) => {
            return pre.id !== this.connection.id;
        })
            .forEach((connection: Connection) => {
                connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
            });

    }
    /*
     *
     *
     * @param {*} data
     * @param {string} topic
     * @param {string} [controller]
     * @param {*} [buffer]
     * @returns {ControllerBase}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    invokeToAll(data: any, topic: string, controller?: string, buffer?: any) {
        this.getConnections().forEach((connection: Connection) => {
            connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
        });

    }
    /**
     *
     *
     * @param {(item: ControllerBase) => boolean} predicate
     * @param {*} data
     * @param {string} topic
     * @param {string} [controller]
     * @param {*} [buffer]
     * @returns {ControllerBase}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    invokeTo(predicate: (item: ControllerBase) => boolean, data: any, topic: string, controller?: string, buffer?: any) {
        let connections = this.findOn<this>(controller || this.alias, predicate);
        connections.forEach((ctrl: ControllerBase) => {
            ctrl.invoke(data, topic, controller || this.alias, buffer);
        });
    }
    /**
     *
     *
     * @param {*} data
     * @param {string} topic
     * @param {string} [controller]
     * @param {*} [buffer]
     * @returns {ControllerBase}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    invoke(data: any, topic: string, controller?: string, buffer?: any): ControllerBase {
        let msg = new TextMessage(topic, data, controller || this.alias, buffer);
        if (this.connection.transport)
            this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
        return this;
    }
    /**
     *
     *
     * @param {*} data
     * @param {string} topic
     * @param {string} [controller]
     * @returns {ControllerBase}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    publish(data: any, topic: string, controller?: string): ControllerBase {
        if (!this.hasSubscription(topic))
            return;
        return this.invoke(data, topic, controller || this.alias);
    }
    /**
     *
     *
     * @param {*} data
     * @param {string} topic
     * @param {string} [controller]
     * @returns {ControllerBase}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    publishToAll(data: any, topic: string, controller?: string) {
        let msg = new TextMessage(topic, data, this.alias);
        this.getConnections().forEach((connection: Connection) => {
            let ctrl = connection.getController(controller || this.alias);
            if (ctrl.getSubscription(topic)) {
                connection.transport.send(msg.toString());
            }
        });

    }
    /**
     *
     *
     * @param {string} topic
     * @returns {boolean}
     *
     * @memberOf Controller
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
     *
     *
     * @param {string} topic
     * @returns {Subscription}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    addSubscription(topic: string): Subscription {
        let subscription = new Subscription(topic, this.alias);
        return this.___subscribe(subscription, topic, this.alias);
    }
    /**
     *
     *
     * @param {string} topic
     * @returns
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    removeSubscription(topic: string) {
        return this.___unsubscribe(this.getSubscription(topic));
    }
    /**
     *
     *
     * @param {string} topic
     * @returns {Subscription}
     *
     * @memberOf Controller
     */
    @CanInvoke(false)
    getSubscription(topic: string): Subscription {
        /**
         *
         *
         * @param {Subscription} pre
         * @returns
         */
        let subscription = this.subscriptions.find((pre: Subscription) => {
            return pre.topic === topic;
        });
        return subscription;
    }
    /**
     *
     *
     *
     * @memberOf Controller
     */
    @CanInvoke(true)
    ___connect() {
        // todo: remove this method
    }
    /**
     *
     *
     *
     * @memberOf Controller
     */
    @CanInvoke(true)
    ___close() {
        this.connection.removeController(this.alias);
        this.invoke({}, " ___close", this.alias);
    }
    /**
     *
     *
     * @param {Subscription} subscription
     * @param {string} topic
     * @param {string} controller
     * @returns {Subscription}
     *
     * @memberOf Controller
     */
    @CanInvoke(true)
    ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription {
        if (this.hasSubscription(subscription.topic)) {
            return;
        }
        this.subscriptions.push(subscription);
        return subscription;
    }

    /**
     *
     *
     * @param {Subscription} subscription
     * @returns {boolean}
     *
     * @memberOf Controller
     */
    @CanInvoke(true)
    ___unsubscribe(subscription: Subscription): boolean {
        let index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));
        if (index >= 0) {
            let result = this.subscriptions.splice(index, 1);
            return true;
        }
        else
            return false;
    }
    get queryParameters(): URLSearchParams {    
        return new URLSearchParams(this.request.url.replace("/?",""));
    }
    get headers(): Map<string, string> {
        let headers = new Map<string, any>();
        try {
            Object.keys(this.connection.transport.request["headers"]).forEach(k => {
                headers.set(k, this.connection.transport.request["headers"][k]);
            });

        } catch{
            return headers;
        }
        return headers;
    }
    get request(): any {
        return this.connection.transport.request;
    }
}
