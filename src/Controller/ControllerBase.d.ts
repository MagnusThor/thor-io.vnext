import { Connection } from '../Connection';
import { Subscription } from '../Subscription';
import { IController } from '../Interfaces/IController';
export interface ControllerBase {
    new (connection: Connection): ControllerBase;
}
export declare class ControllerBase {
    alias: string;
    subscriptions: Array<Subscription>;
    connection: Connection;
    private lastPong;
    private lastPing;
    private heartbeatInterval;
    constructor(connection: Connection);
    private enableHeartbeat;
    canInvokeMethod(method: string): boolean;
    findOn<T>(alias: string, predicate: (item: any) => boolean): Array<IController>;
    getConnections(alias?: string): Array<Connection>;
    onopen(): void;
    onclose(): void;
    find<T, U>(array: T[], predicate: (item: any) => boolean, selector?: (item: T) => U): U[];
    invokeError(ex: any): void;
    invokeToOthers(data: any, topic: string, controller?: string, buffer?: any): void;
    invokeToAll(data: any, topic: string, controller?: string, buffer?: any): void;
    invokeTo(predicate: (item: IController) => boolean, data: any, topic: string, controller?: string, buffer?: any): void;
    invoke(data: any, topic: string, controller?: string, buffer?: any): void;
    publish(data: any, topic: string, controller?: string): IController;
    publishToAll(data: any, topic: string, controller?: string): void;
    hasSubscription(topic: string): boolean;
    addSubscription(topic: string): Subscription;
    removeSubscription(topic: string): boolean;
    getSubscription(topic: string): Subscription;
    ___connect(): void;
    ___close(): void;
    ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription;
    ___unsubscribe(subscription: Subscription): boolean;
}
