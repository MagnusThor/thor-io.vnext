import "reflect-metadata";


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
        static stingToBuffer(str: string) {
            let len = str.length;
            var arr = new Array(len);
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


        static newGuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }
        static randomString() {
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
            this.alias = Reflect.getMetadata("alias", controller)
            this.instance = controller;
        }
    }

    export class Engine {

        private controllers: Array<Plugin<Controller>>
        private connections: Array<Connection>;

        constructor(controllers: Array<any>) {

            this.connections = new Array<Connection>();
            this.controllers = new Array<Plugin<Controller>>();
            controllers.forEach((ctrl: Controller) => {
                let plugin = new Plugin<Controller>(ctrl);
                this.controllers.push(plugin);
            });

            this.createSealdControllers();

        }
        private createSealdControllers() {
            this.controllers.forEach((controller: Plugin<Controller>) => {
                if (Reflect.getMetadata("seald", controller.instance)) {
                    ThorIO.Utils.getInstance<Controller>(controller.instance,
                        new ThorIO.Connection(null, this.connections, this.controllers))
                }
            });
        }
        removeConnection(ws: any, reason: number) {
            try {
                let connection = this.connections.find((pre: Connection) => {
                    return pre.id === ws["$connectionId"];
                });
                let index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            } catch (error) {
                // todo: log error
            }
        };
        addConnection(ws: any, req: any) {
            this.connections.push(
                new Connection(ws, this.connections, this.controllers)
            );
            ws.on("close", (reason) => {
                this.removeConnection(ws, reason);
            });
        }
    }

    export class Message {

        B: ArrayBuffer;
        T: string;
        D: any;
        C: string;

        isBinary: Boolean

        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        constructor(topic: string, object: any, controller: string, arrayBuffer?: ArrayBuffer) {
            this.D = object;
            this.T = topic;
            this.C = controller;
            this.B = arrayBuffer;
            if (arrayBuffer) this.isBinary = true;
        }
        toString() {
            return JSON.stringify(this.JSON);
        }
        static fromArrayBuffer(buffer: Buffer) {
            let headerLen = 8;
            let header = buffer.slice(0, 8);
            let payloadLength = ThorIO.Utils.arrayToLong(header);
            let message = buffer.slice(headerLen, payloadLength + headerLen);
            let blobOffset = headerLen + payloadLength;
            let blob = buffer.slice(blobOffset, buffer.byteLength);
            let data = JSON.parse(message.toString());
            return new Message(data.T, JSON.parse(data.D), data.C, blob);
        }
        toArrayBuffer(): ArrayBuffer {
            let messagePayload = this.toString();
            let payloadLength = messagePayload.length;
            let header = new Buffer(ThorIO.Utils.longToArray(payloadLength));
            let message = new Buffer(payloadLength);
            message.write(messagePayload, 0, payloadLength, "utf-8");
            var blob = new Buffer(this.B);
            var buffer = Buffer.concat([header, message, blob]);

            return buffer


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
    export class Connection {

        public pingPongInterval: number;
        public id: string;
        public ws: any; // Should be WebSocket, be definitins lacks the Ping & Pong....
        public controllerInstances: Array<ThorIO.Controller>;
        public connections: Array<ThorIO.Connection>;
        public clientInfo: ThorIO.ClientInfo;
        private methodInvoker(controller: Controller, method: string, data: any, buffer?: any) {
            try {



                if (!controller.canInvokeMethod(method))
                    throw "method '" + method + "' cant be invoked."

                if (typeof (controller[method]) === "function") {
                    controller[method].apply(
                        controller, [data, method,
                            controller.alias, buffer]);

                } else {
                    // todo : refactor and use PropertyMessage 
                    let prop = method;
                    let propValue = data;
                    if (typeof (controller[prop]) === typeof (propValue))
                        controller[prop] = propValue;
                }



            } catch (ex) {
                controller.invokeError(ex);
            }
        }
        constructor(ws: any, connections: Array<Connection>, private controllers: Array<Plugin<Controller>>) {
            this.connections = connections;
            this.id = ThorIO.Utils.newGuid();
            if (ws) {
                this.ws = ws;
                this.ws["$connectionId"] = this.id; // todo: replace
                this.ws.addEventListener("message", (event: any) => {

                    try {

                        if (!event.binary) {
                            // todo: implement fromString(..) in Message
                            let message = JSON.parse(event.data);
                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, JSON.parse(message.D));
                        } else {
                            let message = Message.fromArrayBuffer(event.data);
                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D, message.B)
                        }
                    } catch (error) {
                        console.log("error", error);
                    }


                });
            }

            this.controllerInstances = new Array<Controller>();
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
                    var controllerInstance = ThorIO.Utils.getInstance<Controller>(resolved, this);

                    this.addControllerInstance(controllerInstance);

                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "___open", controllerInstance.alias);
                    controllerInstance.onopen();

                    return controllerInstance as Controller;
                }
            } catch (error) {
                this.ws.close(1011, "Cannot locate the specified controller, unknown i seald.'" + alias + "'. Connection closed")
                return null;
            }
        }
    }

    // maybe use EventEmitters, a bit fuzzy ? Comments??
    export class Subscription {
        public topic: string;
        public controller: string
        constructor(topic: string, controller: string) {
            this.topic = topic;
            this.controller = controller;
        }
    }

    // export class ControllerBase {

    //     constructor(connection:ThorIO.Connection){

    //     }

    // }


    export class Controller {    //extends ControllerBase{

        @CanSet(false)
        public alias: string;
        @CanSet(false)
        public subscriptions: Array<Subscription>;
        @CanSet(false)
        public connection: Connection
        @CanSet(false)
        private lastPong: Date;
        @CanSet(false)
        private lastPing: Date;
        @CanSet(false)
        private heartbeatInterval: number;

        constructor(connection: Connection) {
            // super(connection);
            this.connection = connection;
            this.subscriptions = new Array<Subscription>();
            this.alias = Reflect.getMetadata("alias", this.constructor);
            this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);

            if (this.heartbeatInterval >= 1000) this.enableHeartbeat();




        }
        @CanInvoke(false)
        private enableHeartbeat() {
            this.connection.ws.addEventListener("pong", () => {
                this.lastPong = new Date();
            });
            let interval = setInterval(() => {
                this.lastPing = new Date();
                if (this.connection.ws.readyState === 1)
                    this.connection.ws.ping();
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
            this.getConnections().filter((pre:Connection) =>{
                return pre.id !== this.connection.id
            })
            .forEach((connection: Connection) => {
                    connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias,buffer);
            });
            return this;
        };
        @CanInvoke(false)
        invokeToAll(data: any, topic: string, controller?: string, buffer?: any): Controller {
         
            this.getConnections().forEach((connection: Connection) => {
                connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias,buffer);

            });
            return this;
        };
        @CanInvoke(false)
        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string, buffer?: any): Controller {
            let connections = this.findOn(controller || this.alias, predicate);
            connections.forEach((ctrl: Controller) => {
                ctrl.invoke(data, topic,controller || this.alias, buffer);
            });
            return this;
        };
        @CanInvoke(false)
        invoke(data: any, topic: string, controller?: string, buffer?: any): Controller {
            let msg = new Message(topic, data,controller || this.alias, buffer);
            if (this.connection.ws)
                this.connection.ws.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
            return this;
        };
        @CanInvoke(false)
        publish(data: any, topic: string, controller?: string): Controller {
            if (!this.hasSubscription(topic)) return;
            return this.invoke(data, topic, controller || this.alias);

        };
        @CanInvoke(false)
        publishToAll(data: any, topic: string, controller?: string): Controller {
            let msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection: Connection) => {
                let ctrl = connection.getController(controller || this.alias);
                if (ctrl.getSubscription(topic)) {
                    connection.ws.send(msg.toString());
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
        @CanInvoke(true) // Hmm
        ___getProperty(data: PropertyMessage) {
            data.value = this[data.name];
            this.invoke(data, "___getProperty", this.alias);
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

    // export class PropertyMessage {
    //     name: string;
    //     value: any;
    //     messageId: string
    //     constructor() {
    //         this.messageId = ThorIO.Utils.newGuid();
    //     }
    // }


    /*
        namespace contains built-in ThorIO.Controller's
    */
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
            message: string
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
                this.Connections = new Array<PeerConnection>();
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