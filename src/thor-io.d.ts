import "reflect-metadata";
export declare function CanInvoke(state: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function CanSet(state: boolean): (target: Object, propertyKey: string) => void;
export declare function ControllerProperties(alias: string): (target: Function) => void;
export declare namespace ThorIO {
    class EndPoint {
        private fn;
        private serializeMessage(data);
        private deserializeMessage(data);
        constructor(port: number, fn?: Function);
    }
    class Utils {
        static newGuid(): string;
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
        removeConnection(ws: any, reason: number): void;
        addConnection(ws: any): void;
    }
    class Message {
        T: string;
        D: any;
        C: string;
        JSON: any;
        constructor(topic: string, object: any, controller: string);
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
        id: string;
        ws: WebSocket;
        controllerInstances: Array<ThorIO.Controller>;
        connections: Array<ThorIO.Connection>;
        clientInfo: ThorIO.ClientInfo;
        private methodInvoker(controller, method, data);
        constructor(ws: WebSocket, connections: Array<Connection>, controllers: Array<Plugin<Controller>>);
        hasController(alias: string): boolean;
        removeController(alias: string): void;
        getController(alias: string): Controller;
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
        client: Connection;
        constructor(client: Connection);
        canInvokeMethod(method: string): any;
        getConnections(alias?: string): Connection[];
        onopen(): void;
        onclose(): void;
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector?: (item: T) => U): U[];
        invokeError(error: any): void;
        invokeToAll(data: any, topic: string, controller: string): void;
        invokeTo(expression: (item: Controller) => boolean, data: any, topic: string, controller: string): void;
        invoke(data: any, topic: string, controller: string): void;
        subscribe(subscription: Subscription, topic: string, controller: string): Subscription;
        unsubscribe(subscription: Subscription): boolean;
        publish(data: any, topic: string, controller: string): void;
        publishToAll(data: any, topic: string, controller: string): void;
        hasSubscription(topic: string): boolean;
        getSubscription(topic: string): Subscription;
        $connect_(): void;
        $close_(): void;
    }
}
