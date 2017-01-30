import * as net from 'net';
import 'reflect-metadata';

export function CanInvoke(state: boolean) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    }
}
export function CanSet(state: boolean) {
    return function (target: Object, propertyKey: string) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    }
}
export function ControllerProperties(alias: string, seald?: boolean, heartbeatInterval?: number) {
    return function (target: Function) {
        Reflect.defineMetadata("seald", seald || false, target);
        Reflect.defineMetadata("alias", alias, target);
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval || -1, target)
    }
}

export namespace ThorIO {


    export class Utils {
        static stingToBuffer(str: string): Uint8Array {
            let len = str.length;
            let arr = new Array(len);
            for (let i = 0; i < len; i++) {
                arr[i] = str.charCodeAt(i) & 0xFF;
            }
            return new Uint8Array(arr);
        }
        static arrayToLong(byteArray: Uint8Array): number {
            var value = 0;
            for (var i = byteArray.byteLength - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i];
            }
            return value;
        }
        static longToArray(long: number): Array<number> {
            var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
            for (var index = 0; index < byteArray.length; index++) {
                var byte = long & 0xff;
                byteArray[index] = byte;
                long = (long - byte) / 256;
            }
            return byteArray;
        }
        static newGuid(): string {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }
        static randomString(): string {
            return Math.random().toString(36).substring(2);
        }
        static getInstance<T>(obj: any, ...args: any[]): T {
            var instance = Object.create(obj.prototype);
            instance.constructor.apply(instance, args);
            return <T>instance;
        }

    }

    export class Plugin<T> {
        public alias: string;
        public instance: T;
        constructor(controller: T) {
            this.alias = Reflect.getMetadata("alias", controller);
            this.instance = controller;
        }
    }

    export class Engine {

        private controllers: Array<Plugin<Controller>>;
        private connections: Array<Connection>;
        private endpoints: Array<any>;

        constructor(controllers: Array<any>) {
            this.endpoints = [];
            this.connections = [];
            this.controllers = [];

            controllers.forEach((ctrl: Controller) => {
                if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                    throw "Faild to register on of the specified ThorIO.Controller's"
                }
                var plugin = new Plugin<Controller>(ctrl);
                this.controllers.push(plugin);

            });
        }

        private createSealdControllers() {
            this.controllers.forEach((controller: Plugin<Controller>) => {
                if (Reflect.getMetadata("seald", controller.instance)) {
                    ThorIO.Utils.getInstance<Controller>(controller.instance,
                        new ThorIO.Connection(null, this.connections, this.controllers))
                }
            });
        }
        removeConnection(id: string, reason: number): void {
            try {
                let connection = this.connections.find((pre: Connection) => {
                    return pre.id === id;
                });
                let index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            } catch (error) {
                // todo: do op's
            }
        }
        addEndpoint(typeOfTransport: { new (...args: any[]): ITransport; }, host: string, port: number): net.Server {
            let endpoint = net.createServer((socket: net.Socket) => {
                let transport = new typeOfTransport(socket);
                this.addConnection(transport);
            });
            endpoint.listen(port, host, ((listener: any) => {
                // do op
            }));
            this.endpoints.push(endpoint);
            return endpoint;
        }

        addWebSocket(ws: any, req: any): void {
            let transport = new WebSocketMessageTransport(ws);
            this.addConnection(transport)
        }

        private addConnection(transport: ITransport): void {

            transport.addEventListener("close", (reason) => {
                this.removeConnection(transport.id, reason);
            });
            this.connections.push(
                new Connection(transport, this.connections, this.controllers)
            );
        }
    }

    export class Message {

        B: Buffer;
        T: string;
        D: any;
        C: string;

        isBinary: Boolean;

        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        constructor(topic: string, data: string, controller: string, arrayBuffer?: Buffer) {
            this.D = data;
            this.T = topic;
            this.C = controller;
            this.B = arrayBuffer;
            if (arrayBuffer) this.isBinary = true;
        }
        toString() {
            return JSON.stringify(this.JSON);
        }
        static fromArrayBuffer(buffer: Buffer): Message {
            let headerLen = 8;
            let header = buffer.slice(0, 8);
            let payloadLength = ThorIO.Utils.arrayToLong(header);
            let message = buffer.slice(headerLen, payloadLength + headerLen);
            let blobOffset = headerLen + payloadLength;
            let blob = buffer.slice(blobOffset, buffer.byteLength);
            let data = JSON.parse(message.toString());
            return new Message(data.T, data.D, data.C, blob);
        }
        toArrayBuffer(): Buffer {
            let messagePayload = this.toString();
            let payloadLength = messagePayload.length;
            let header = new Buffer(ThorIO.Utils.longToArray(payloadLength));
            let message = new Buffer(payloadLength);
            message.write(messagePayload, 0, payloadLength, "utf-8");
            var blob = new Buffer(this.B);
            var buffer = Buffer.concat([header, message, blob]);
            return buffer;
        }

    }

    export class Listener {
        fn: Function;
        topic: string;
        constructor(topic: string, fn: Function) {
            this.fn = fn;
            this.topic = topic;
        }
    }
    // todo: refactor this, implememt PI for a sticky session?
    export class ClientInfo {
        public CI: string;
        public C: string;
        public TS: Date;
        constructor(ci: string, controller: string) {
            this.CI = ci;
            this.C = controller;
            this.TS = new Date();
        }
    }

    export interface ITransport {
        id: string
        send(data: any)
        close(reason: number, message: any)
        addEventListener(topic: string, fn: Function)
        socket: any;
        readyState: number;
        ping()
        onMessage: (message: ITransportMessage) => void
    }

    export interface ITransportMessage {
        toMessage(): ThorIO.Message
        toBuffer(message?: ThorIO.Message): Buffer
        binary: boolean
        data: any
    }

    export class PipeMessage implements ITransportMessage {

        private message: Message;
        private arr: Array<string>;
        constructor(public data: any, public binary: boolean) {

            this.message = JSON.parse(this.data) as Message;

            this.arr = new Array<string>();
            this.arr.push(this.message.C);
            this.arr.push(this.message.T);
            this.arr.push(this.message.D);

        }

        toBuffer() {
            return new Buffer(this.arr.join("|"));
        }
        public toMessage(): Message {
            return this.message;
        }
    }

    export class BufferMessage implements ITransportMessage {

        constructor(public data: Buffer, public binary: boolean) {

        }

        toMessage(): Message {

            const headerLen = 3;

            const tLen = this.data.readUInt8(0);
            const cLen = this.data.readUInt8(1);
            const dLen = this.data.readUInt8(2);

            let offset = headerLen;
            const topic = this.data.toString("utf-8", offset, tLen + offset);

            offset += tLen;
            const controller = this.data.toString("utf-8", offset, offset + cLen);

            offset += cLen;
            const data = this.data.toString("utf-8", offset, offset + dLen)

            let message = new ThorIO.Message(topic, data, controller);

            return message;

        }

        toBuffer(): Buffer {

            let message = JSON.parse(this.data.toString()) as Message;

            const header = 3;
            let offset = 0;

            const tLen = message.T.length;
            const dLen = message.D.length;
            const cLen = message.C.length;

            let bufferSize = header + tLen + dLen + cLen;

            let buffer = new Buffer(bufferSize);

            buffer.writeUInt8(tLen, 0);

            buffer.writeUInt8(cLen, 1)

            buffer.writeInt8(dLen, 2);

            offset = header;
            buffer.write(message.T, offset);
            offset += tLen;
            buffer.write(message.C, offset);
            offset += cLen;
            buffer.write(message.D, offset);

            return buffer;

        }


    }

    export class WebSocketMessage implements ITransportMessage {
        constructor(public data: string, public binary) {

        }
        toBuffer(): Buffer {
            throw "not yet implemented";
        }
        toMessage(): Message {
            return JSON.parse(this.data) as Message;
        }
    }

    export class BufferMessageTransport implements ITransport {
        id: string;
        onMessage: (messsage: ITransportMessage) => void;
        constructor(public socket: net.Socket) {
            this.id = ThorIO.Utils.newGuid();

            this.socket.addListener("data", (buffer: Buffer) => {

                let bm = new BufferMessage(buffer, false);

                this.onMessage(bm);

            });
        }
        get readyState() {
            return 1;
        }
        send(data: string) {
            let bm = new BufferMessage(new Buffer(data), false);
            this.socket.write(bm.toBuffer())
        }
        addEventListener(name: string, fn: Function) {
            this.socket.addListener(name, fn);

        }
        ping() {
            return;
        }
        close() {
            this.socket.destroy();
        }
    }

    export class PipeMessageTransport implements ITransport {
        id: string;
        onMessage: (message: PipeMessage) => void;
        send(data: any) {

            let message = new PipeMessage(data, false);

            this.socket.write(message.toBuffer());
        }
        close(reason: number, message: any) {
            this.socket.destroy();
        }
        addEventListener(name: string, fn: Function) {
            this.socket.addListener(name, fn);
        }
        get readyState(): number {
            return 1;
        }
        ping() {
            return;
        }
        constructor(public socket: net.Socket) {
            this.id = ThorIO.Utils.newGuid();
            socket.addListener("data", (buffer: Buffer) => {
                let args = buffer.toString().split("|");
                let message = new Message(args[1], args[2], args[0]);
                this.onMessage(new PipeMessage(message.toString(), false))
            });
        }
    }

    export class WebSocketMessageTransport implements ITransport {
        socket: WebSocket;
        onMessage: (message: ITransportMessage) => void;;
        id: string;
        send(data: any) {

            this.socket.send(data)
        }
        close(reason: number, message: string) {
            this.socket.close(reason, message)
        }
        addEventListener(name: string, fn: any) {
            this.socket.addEventListener(name, fn)
        }
        constructor(socket: any) {
            this.id = ThorIO.Utils.newGuid();
            this.socket = socket;
            this.socket.addEventListener("message", (event: any) => {
                this.onMessage(new WebSocketMessage(event.data, event.binary));
            });
        }
        get readyState() {
            return this.socket.readyState;
        }
        ping() {
            this.socket["ping"]();
        }
    }

    export class Connection {
        public errors: Array<any>;
        public pingPongInterval: number;
        public controllerInstances: Array<ThorIO.Controller>;
        public clientInfo: ThorIO.ClientInfo;
        private methodInvoker(controller: Controller, method: string, data: string, buffer?: any) {
            try {
                if (!controller.canInvokeMethod(method))
                    throw "method '" + method + "' cant be invoked.";
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(
                        controller, [JSON.parse(data), method,
                        controller.alias, buffer]);
                } else {
                    let prop = method;
                    let propValue = JSON.parse(data);
                    if (typeof (controller[prop]) === typeof (propValue))
                        controller[prop] = propValue;
                }
            } catch (ex) {
                controller.invokeError(ex);
            }
        }

        get id(): string {
            return this.transport.id;
        }
        constructor(public transport: ITransport, public connections: Array<Connection>, private controllers: Array<Plugin<Controller>>) {
            this.connections = connections;
            this.controllerInstances = [];
            this.errors = [];
            if (transport) {
                this.transport.onMessage = (event: ITransportMessage) => {
                    try {
                        if (!event.binary) {

                            let message = event.toMessage();

                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D);
                        } else {
                            let message = Message.fromArrayBuffer(event.data);
                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D, message.B)
                        }
                    } catch (error) {

                        this.addError(error);
                    }
                };
            }

        }

        private addError(error: any) {
            this.errors.push(error);
        }

        hasController(alias: string): boolean {
            let match = this.controllerInstances.filter((pre: Controller) => {
                return pre.alias == alias;
            });
            return match.length >= 0;
        }
        removeController(alias: string) {
            let index = this.controllerInstances.indexOf(this.getController(alias));
            if (index > -1)
                this.controllerInstances.splice(index, 1);
        }
        getController(alias: string): Controller {
            try {
                let match = this.controllerInstances.filter((pre: Controller) => {
                    return pre.alias == alias;
                });
                return match[0];
            } catch (error) {
                return null
            }
        }
        private addControllerInstance(controller: Controller): Controller {
            this.controllerInstances.push(controller);
            return controller;
        }
        private registerSealdController() {
            throw "not yet implemented";
        }
        locateController(alias: string): Controller {
            try {

                let match = this.controllerInstances.find((pre: Controller) => {
                    return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
                });
                if (match) {
                    return match;
                } else {
                    let resolved = this.controllers.filter((resolve: Plugin<Controller>) => {
                        return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                    })[0].instance;


                    let controllerInstance = ThorIO.Utils.getInstance<Controller>(resolved, this);

                    this.addControllerInstance(controllerInstance);

                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "___open", controllerInstance.alias);

                    controllerInstance.onopen();

                    return controllerInstance as Controller;
                }
            } catch (error) {
                this.transport.close(1011, "Cannot locate the specified controller,it may be seald or the the alias in unknown '" + alias + "'. connection closed");
                return null;
            }
        }
    }

    export class Subscription {
        public topic: string;
        public controller: string;
        constructor(topic: string, controller: string) {
            this.topic = topic;
            this.controller = controller;
        }
    }

    export class Controller {

        @CanSet(false)
        public alias: string;
        @CanSet(false)
        public subscriptions: Array<Subscription>;
        @CanSet(false)
        public connection: Connection;
        @CanSet(false)
        private lastPong: Date;
        @CanSet(false)
        private lastPing: Date;
        @CanSet(false)
        private heartbeatInterval: number;

        constructor(connection: Connection) {
            this.connection = connection;
            this.subscriptions = [];
            this.alias = Reflect.getMetadata("alias", this.constructor);

            this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);
            if (this.heartbeatInterval >= 1000) this.enableHeartbeat();
        }
        @CanInvoke(false)
        private enableHeartbeat() {
            this.connection.transport.addEventListener("pong", () => {
                this.lastPong = new Date();
            });
            let interval = setInterval(() => {
                this.lastPing = new Date();
                if (this.connection.transport.readyState === 1)
                    this.connection.transport.ping();
            }, this.heartbeatInterval);
        }
        @CanInvoke(false)
        public canInvokeMethod(method: string): boolean {
            return Reflect.getMetadata("canInvokeOrSet", this, method);
        }
        @CanInvoke(false)
        findOn<T>(alias: string, predicate: (item: any) => boolean): Array<any> {
            let connections = this.getConnections(alias).map((p: Connection) => {
                return p.getController(alias);
            });
            return connections.filter(predicate);
        }
        @CanInvoke(false)
        getConnections(alias?: string): Array<Connection> {
            if (!alias) {
                return this.connection.connections;
            } else {
                return this.connection.connections.map((conn: Connection) => {
                    if (conn.hasController(this.alias))
                        return conn;
                })
            }
        }
        @CanInvoke(false)
        onopen() { }

        @CanInvoke(false)
        onclose() { }

        @CanInvoke(false)
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector: (item: T) => U = (x: T) => <U><any>x): U[] {
            return array.filter(predicate).map(selector);
        }
        @CanInvoke(false)
        invokeError(error: any) {
            let msg = new Message("___error", error, this.alias).toString();
            this.invoke(error, "___error", this.alias);
        }
        @CanInvoke(false)
        invokeToOthers(data: any, topic: string, controller?: string, buffer?: any): Controller {
            this.getConnections().filter((pre: Connection) => {
                return pre.id !== this.connection.id
            })
                .forEach((connection: Connection) => {
                    connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
                });
            return this;
        }
        @CanInvoke(false)
        invokeToAll(data: any, topic: string, controller?: string, buffer?: any): Controller {
            this.getConnections().forEach((connection: Connection) => {
                connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);

            });
            return this;
        }
        @CanInvoke(false)
        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string, buffer?: any): Controller {
            let connections = this.findOn(controller || this.alias, predicate);
            connections.forEach((ctrl: Controller) => {
                ctrl.invoke(data, topic, controller || this.alias, buffer);
            });
            return this;
        }
        @CanInvoke(false)
        invoke(data: any, topic: string, controller?: string, buffer?: any): Controller {
            let msg = new Message(topic, data, controller || this.alias, buffer);
            if (this.connection.transport)
                this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
            return this;
        }
        @CanInvoke(false)
        publish(data: any, topic: string, controller?: string): Controller {
            if (!this.hasSubscription(topic)) return;
            return this.invoke(data, topic, controller || this.alias);

        }
        @CanInvoke(false)
        publishToAll(data: any, topic: string, controller?: string): Controller {
            let msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection: Connection) => {
                let ctrl = connection.getController(controller || this.alias);
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            });
            return this;
        }
        @CanInvoke(false)
        hasSubscription(topic: string): boolean {
            let p = this.subscriptions.filter(
                (pre: Subscription) => {
                    return pre.topic === topic
                }
            );
            return !(p.length === 0);
        }
        @CanInvoke(false)
        addSubscription(topic: string): Subscription {
            let subscription = new Subscription(topic, this.alias);
            return this.___subscribe(subscription, topic, this.alias);
        }

        @CanInvoke(false)
        removeSubscription(topic: string) {
            return this.___unsubscribe(this.getSubscription(topic));
        }

        @CanInvoke(false)
        getSubscription(topic: string): Subscription {
            let subscription = this.subscriptions.find(
                (pre: Subscription) => {
                    return pre.topic === topic;
                }
            );
            return subscription;
        }

        @CanInvoke(true)
        ___connect() {
            // todo: remove this method
        }

        @CanInvoke(true)
        ___close() {
            this.connection.removeController(this.alias);
            this.invoke({}, " ___close", this.alias);
        }
        @CanInvoke(true)
        ___subscribe(subscription: Subscription, topic: string, controller: string): Subscription {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            this.subscriptions.push(subscription);
            return subscription;
        };
        @CanInvoke(true)
        ___unsubscribe(subscription: Subscription): boolean {
            let index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));

            if (index >= 0) {
                let result = this.subscriptions.splice(index, 1);
                return true;
            } else
                return false;
        };
    }

    export namespace Controllers {

        export class InstantMessage {
            text: string;
        }

        export class PeerConnection {
            context: string;
            peerId: string;
            constructor(context?: string, peerId?: string) {
                this.context = context;
                this.peerId = peerId;
            }
        }
        export class Signal {
            recipient: string;
            sender: string;
            message: string;
            constructor(recipient: string, sender: string, message: string) {
                this.recipient = recipient;
                this.sender = sender;
                this.message = message;
            }
        }
        @ControllerProperties("contextBroker", false, 7500)
        export class BrokerController extends ThorIO.Controller {
            public Connections: Array<PeerConnection>;
            public Peer: PeerConnection;
            public localPeerId: string;

            constructor(connection: ThorIO.Connection) {
                super(connection);
                this.Connections = [];
            }

            onopen() {
                this.Peer = new PeerConnection(ThorIO.Utils.newGuid(), this.connection.id);
                this.invoke(this.Peer, "contextCreated", this.alias);
            }
            @CanInvoke(true)
            instantMessage(data: any, topic: string, controller: string) {
                var expression = (pre: BrokerController) => {
                    return pre.Peer.context >= this.Peer.context
                };
                this.invokeTo(expression, data, "instantMessage", this.alias);
            }

            @CanInvoke(true)
            changeContext(change: PeerConnection) {
                this.Peer.context = change.context;
                this.invoke(this.Peer, "contextChanged", this.alias);
            }
            @CanInvoke(true)
            contextSignal(signal: Signal) {
                let expression = (pre: BrokerController) => {
                    return pre.connection.id === signal.recipient;
                };
                this.invokeTo(expression, signal, "contextSignal", this.alias);
            }
            @CanInvoke(true)
            connectContext() {
                let connections = this.getPeerConnections(this.Peer).map((p: BrokerController) => {
                    return p.Peer
                });
                this.invoke(connections, "connectTo", this.alias);
            }
            getPeerConnections(peerConnetion: PeerConnection): Array<BrokerController> {
                let match = this.findOn(this.alias, (pre: BrokerController) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId
                });
                return match;
            }
        }


    }


}