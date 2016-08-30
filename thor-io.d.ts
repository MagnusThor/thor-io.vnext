import "reflect-metadata";
export declare function CanInvoke(state: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function CanSet(state: boolean): (target: Object, propertyKey: string) => void;
export declare function ControllerProperties(alias: string, seald?: boolean, heartbeatInterval?: number): (target: Function) => void;
export declare namespace ThorIO {
    class Utils {
        static newGuid(): string;
        static getInstance<T>(obj: any, ...args: any[]): T;
    }
    class Plugin<T> {
        alias: string;
        instance: T;
        constructor(controller: T);
    }
    class Engine {
        private controllers;
        private connections;
        private _engine;
        constructor(controllers: Array<any>);
        private createSealdControllers();
        removeConnection(ws: any, reason: number): void;
        addConnection(ws: any): void;
    }
    class Message {
        T: string;
        D: any;
        C: string;
        id: string;
        JSON: any;
        constructor(topic: string, object: any, controller: string, id?: string);
        toString(): string;
    }
    class Listener {
        fn: Function;
        topic: string;
        constructor(topic: string, fn: Function);
    }
    class ClientInfo {
        CI: string;
        C: string;
        constructor(ci: string, controller: string);
    }
    class Connection {
        private controllers;
        pingPongInterval: number;
        id: string;
        ws: any;
        controllerInstances: Array<ThorIO.Controller>;
        connections: Array<ThorIO.Connection>;
        clientInfo: ThorIO.ClientInfo;
        private methodInvoker(controller, method, data);
        constructor(ws: any, connections: Array<Connection>, controllers: Array<Plugin<Controller>>);
        hasController(alias: string): boolean;
        removeController(alias: string): void;
        getController(alias: string): Controller;
        private addControllerInstance(controller);
        private registerSealdController();
        locateController(alias: string): Controller;
    }
    class Subscription {
        topic: string;
        controller: string;
        constructor(topic: string, controller: string);
    }
    class Controller {
        alias: string;
        subscriptions: Array<Subscription>;
        connection: Connection;
        private lastPong;
        private lastPing;
        private heartbeatInterval;
        constructor(client: Connection);
        private enableHeartbeat();
        canInvokeMethod(method: string): any;
        findOn<T>(alias: string, predicate: (item: any) => boolean): Array<any>;
        getConnections(alias?: string): Array<Connection>;
        onopen(): void;
        onclose(): void;
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector?: (item: T) => U): U[];
        invokeError(error: any): void;
        invokeToAll(data: any, topic: string, controller: string): Controller;
        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string): Controller;
        invoke(data: any, topic: string, controller: string): Controller;
        publish(data: any, topic: string, controller: string): Controller;
        publishToAll(data: any, topic: string, controller: string): Controller;
        hasSubscription(topic: string): boolean;
        addSubscription(topic: string): Subscription;
        removeSubscription(topic: string): boolean;
        getSubscription(topic: string): Subscription;
        ___connect(): void;
        ___getProperty(data: PropertyMessage): void;
        ___close(): void;
        ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription;
        ___unsubscribe(subscription: Subscription): boolean;
    }
    class PropertyMessage {
        name: string;
        value: any;
        messageId: string;
        constructor();
    }
}
