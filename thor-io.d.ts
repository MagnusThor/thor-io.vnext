import * as net from 'net';
import 'reflect-metadata';
export declare function CanInvoke(state: boolean): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function CanSet(state: boolean): (target: Object, propertyKey: string) => void;
export declare function ControllerProperties(alias: string, seald?: boolean, heartbeatInterval?: number): (target: Function) => void;
export declare namespace ThorIO {
    class Utils {
        static stingToBuffer(str: string): Uint8Array;
        static arrayToLong(byteArray: Uint8Array): number;
        static longToArray(long: number): Array<number>;
        static newGuid(): string;
        static randomString(): string;
    }
    class Plugin<T> {
        alias: string;
        instance: T;
        constructor(controller: T);
    }
    class Engine {
        private controllers;
        private connections;
        private endpoints;
        constructor(controllers: Array<any>);
        createSealdControllers(): void;
        removeConnection(id: string, reason: number): void;
        addEndpoint(typeOfTransport: {
            new (...args: any[]): ITransport;
        }, host: string, port: number): net.Server;
        addWebSocket(ws: any, req: any): void;
        private addConnection(transport);
    }
    class Message {
        B: Buffer;
        T: string;
        D: any;
        C: string;
        isBinary: Boolean;
        readonly JSON: any;
        constructor(topic: string, data: string, controller: string, arrayBuffer?: Buffer);
        toString(): string;
        static fromArrayBuffer(buffer: Buffer): Message;
        toArrayBuffer(): Buffer;
    }
    class Listener {
        fn: Function;
        topic: string;
        constructor(topic: string, fn: Function);
    }
    class ClientInfo {
        CI: string;
        C: string;
        TS: Date;
        constructor(ci: string, controller: string);
    }
    interface ITransport {
        id: string;
        send(data: any): any;
        close(reason: number, message: any): any;
        addEventListener(topic: string, fn: Function): any;
        socket: any;
        readyState: number;
        ping(): any;
        onMessage: (message: ITransportMessage) => void;
    }
    interface ITransportMessage {
        toMessage(): ThorIO.Message;
        toBuffer(message?: ThorIO.Message): Buffer;
        binary: boolean;
        data: any;
    }
    class PipeMessage implements ITransportMessage {
        data: any;
        binary: boolean;
        private message;
        private arr;
        constructor(data: any, binary: boolean);
        toBuffer(): Buffer;
        toMessage(): Message;
    }
    class BufferMessage implements ITransportMessage {
        data: Buffer;
        binary: boolean;
        constructor(data: Buffer, binary: boolean);
        toMessage(): Message;
        toBuffer(): Buffer;
    }
    class WebSocketMessage implements ITransportMessage {
        data: string;
        binary: any;
        constructor(data: string, binary: any);
        toBuffer(): Buffer;
        toMessage(): Message;
    }
    class BufferMessageTransport implements ITransport {
        socket: net.Socket;
        id: string;
        onMessage: (messsage: ITransportMessage) => void;
        constructor(socket: net.Socket);
        readonly readyState: number;
        send(data: string): void;
        addEventListener(name: string, fn: Function): void;
        ping(): void;
        close(): void;
    }
    class PipeMessageTransport implements ITransport {
        socket: net.Socket;
        id: string;
        onMessage: (message: PipeMessage) => void;
        send(data: any): void;
        close(reason: number, message: any): void;
        addEventListener(name: string, fn: Function): void;
        readonly readyState: number;
        ping(): void;
        constructor(socket: net.Socket);
    }
    class WebSocketMessageTransport implements ITransport {
        socket: WebSocket;
        onMessage: (message: ITransportMessage) => void;
        id: string;
        send(data: any): void;
        close(reason: number, message: string): void;
        addEventListener(name: string, fn: any): void;
        constructor(socket: any);
        readonly readyState: number;
        ping(): void;
    }
    class Connection {
        transport: ITransport;
        connections: Array<Connection>;
        private controllers;
        errors: Array<any>;
        pingPongInterval: number;
        controllerInstances: Array<ThorIO.Controller>;
        clientInfo: ThorIO.ClientInfo;
        private methodInvoker(controller, method, data, buffer?);
        readonly id: string;
        constructor(transport: ITransport, connections: Array<Connection>, controllers: Array<Plugin<Controller>>);
        private addError(error);
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
    interface Controller {
        new (connection: ThorIO.Connection): ThorIO.Controller;
    }
    class Controller implements Controller {
        alias: string;
        subscriptions: Array<Subscription>;
        connection: Connection;
        private lastPong;
        private lastPing;
        private heartbeatInterval;
        constructor(connection: Connection);
        private enableHeartbeat();
        canInvokeMethod(method: string): boolean;
        findOn<T>(alias: string, predicate: (item: any) => boolean): Array<any>;
        getConnections(alias?: string): Array<Connection>;
        onopen(): void;
        onclose(): void;
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector?: (item: T) => U): U[];
        invokeError(error: any): void;
        invokeToOthers(data: any, topic: string, controller?: string, buffer?: any): Controller;
        invokeToAll(data: any, topic: string, controller?: string, buffer?: any): Controller;
        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string, buffer?: any): Controller;
        invoke(data: any, topic: string, controller?: string, buffer?: any): Controller;
        publish(data: any, topic: string, controller?: string): Controller;
        publishToAll(data: any, topic: string, controller?: string): Controller;
        hasSubscription(topic: string): boolean;
        addSubscription(topic: string): Subscription;
        removeSubscription(topic: string): boolean;
        getSubscription(topic: string): Subscription;
        ___connect(): void;
        ___close(): void;
        ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription;
        ___unsubscribe(subscription: Subscription): boolean;
    }
    namespace Controllers {
        class InstantMessage {
            text: string;
        }
        class PeerConnection {
            context: string;
            peerId: string;
            constructor(context?: string, peerId?: string);
        }
        class Signal {
            recipient: string;
            sender: string;
            message: string;
            constructor(recipient: string, sender: string, message: string);
        }
        class BrokerController extends ThorIO.Controller {
            Connections: Array<PeerConnection>;
            Peer: PeerConnection;
            localPeerId: string;
            constructor(connection: ThorIO.Connection);
            onopen(): void;
            instantMessage(data: any, topic: string, controller: string): void;
            changeContext(change: PeerConnection): void;
            contextSignal(signal: Signal): void;
            connectContext(): void;
            getPeerConnections(peerConnetion: PeerConnection): Array<BrokerController>;
        }
    }
}
