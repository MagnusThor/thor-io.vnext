export declare namespace ThorIO {
    class Utils {
        static newGuid(): string;
    }
    class Plugin {
        alias: string;
        instance: any;
        constructor();
    }
    class Engine {
        private controllers;
        private connections;
        private _engine;
        constructor(controllers: Array<any>);
        private log(error);
        findController(alias: string): Controller;
        findConnection(id: string): Connection;
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
        queue: Array<Message>;
        controllerInstances: Array<Controller>;
        connections: Array<Connection>;
        clientInfo: ThorIO.ClientInfo;
        constructor(ws: WebSocket, connections: Array<Connection>, controllers: Array<Plugin>);
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
        getConnections(alias?: string): Connection[];
        onopen(): void;
        invokeToAll(data: any, topic: string, controller: string): void;
        private filterControllers(what, pre);
        invokeTo(expression: Function, data: any, topic: string, controller: string): void;
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
