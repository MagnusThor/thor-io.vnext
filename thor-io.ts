import "reflect-metadata";

export function CanInvoke(state: boolean) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("invokeable", state, target, propertyKey);
    }
}
export function CanSet(state: boolean) {
    return function (target: Object, propertyKey: string) {
        Reflect.defineMetadata("invokeable", state, target, propertyKey);
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
        static newGuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
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
        private _engine: Engine;
        constructor(controllers: Array<any>) {
            this._engine = this;
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
                    ThorIO.Utils.getInstance<Controller>(controller.instance, new ThorIO.Connection(null, this.connections, this.controllers))
                }
            });
        }
        removeConnection(ws: any, reason: number) {
            try {
                let connection = this.connections.filter((pre: Connection) => {
                    return pre.id === ws["$connectionId"];
                })[0];
                let index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            } catch (error) {
                // todo: log error
            }
        };
        addConnection(ws: any) {
            this.connections.push(
                new Connection(ws, this.connections, this.controllers)
            );
            ws.on("close", (reason) => {
                this.removeConnection(ws, reason);
            });



        }
    }

    export class Message {

        T: string;
        D: any;
        C: string;
        id: string;
        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        constructor(topic: string, object: any, controller: string, id?: string) {
            this.D = object;
            this.T = topic;
            this.C = controller;
            this.id = id;
        }
        toString() {
            return JSON.stringify(this.JSON);
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
        constructor(ci: string, controller: string) {
            this.CI = ci;
            this.C = controller;
        }
    }
    export class Connection {

        public pingPongInterval: number;
        public id: string;
        public ws: any;
        public controllerInstances: Array<ThorIO.Controller>;
        public connections: Array<ThorIO.Connection>;
        public clientInfo: ThorIO.ClientInfo;
        private methodInvoker(controller: Controller, method: string, data: any) {
            try {
                if (!controller.canInvokeMethod(method))
                    throw "method '" + method + "' cant be invoked."
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(controller, [data, method, controller.alias]);

                } else {
                    // todo : refactor and use PropertyMessage ?
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
                this.ws.addEventListener("message", (message: MessageEvent) => {
                    let json = JSON.parse(message.data);
                    let controller = this.locateController(json.C);
                    this.methodInvoker(controller, json.T, JSON.parse(json.D));
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
        // todo: refactor and improve..
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
                let match = this.controllerInstances.filter((pre: Controller) => {
                    return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
                });
                if (match.length > 0) {
                    return match[0];
                } else {
                    let resolved = this.controllers.filter((resolve: Plugin<Controller>) => {
                        return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                    })[0].instance;
                    var controllerInstance = ThorIO.Utils.getInstance<Controller>(resolved, this);

                    this.addControllerInstance(controllerInstance);

                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), " ___open", controllerInstance.alias);
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

    export class Controller {
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

        constructor(client: Connection) {
            this.connection = client;
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
        public canInvokeMethod(method: string): any {
            return Reflect.getMetadata("invokeable", this, method);
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
            }
            else {
                return this.connection.connections.map((conn: Connection) => {
                    if (conn.hasController(this.alias))
                        return conn;
                })
            }
        }
        @CanInvoke(false)
        onopen() {
        }
        @CanInvoke(false)
        onclose() {
        }
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
        invokeToAll(data: any, topic: string, controller: string): Controller {
            let msg = new Message(topic, data, this.alias).toString();;
            this.getConnections().forEach((connection: Connection) => {
                connection.getController(controller).invoke(data, topic, controller);

            });
            return this;
        };
        @CanInvoke(false)
        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string): Controller {
            let connections = this.findOn(controller, predicate);
            connections.forEach((controller: Controller) => {
                controller.invoke(data, topic, this.alias);
            });
            return this;
        };
        @CanInvoke(false)
        invoke(data: any, topic: string, controller: string): Controller {
            let msg = new Message(topic, data, this.alias);
            if (this.connection.ws)
                this.connection.ws.send(msg.toString());
            return this;
        };
        @CanInvoke(false)
        publish(data: any, topic: string, controller: string): Controller {
            if (!this.hasSubscription(topic)) return;
            return this.invoke(data, topic, this.alias);

        };
        @CanInvoke(false)
        publishToAll(data: any, topic: string, controller: string): Controller {
            let msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection: Connection) => {
                let controller = connection.getController(this.alias);
                if (controller.getSubscription(topic)) {
                    connection.ws.send(msg.toString());
                }
            });
            return this;
        }
        @CanInvoke(false)
        public hasSubscription(topic: string): boolean {
            let p = this.subscriptions.filter(
                (pre: Subscription) => {
                    return pre.topic === topic
                }
            );
            return !(p.length === 0);
        }
        @CanInvoke(false)
        public addSubscription(topic: string): Subscription {
            let subscription = new Subscription(topic, this.alias);
            return this.___subscribe(subscription, topic, this.alias);
        }

        @CanInvoke(false)
        public removeSubscription(topic: string) {
            return this.___unsubscribe(this.getSubscription(topic));
        }

        @CanInvoke(false)
        public getSubscription(topic: string): Subscription {
            let subscription = this.subscriptions.filter(
                (pre: Subscription) => {
                    return pre.topic === topic;
                }
            );
            return subscription[0];
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

    export class PropertyMessage {
        name: string;
        value: any;
        messageId: string
        constructor() {
            this.messageId = ThorIO.Utils.newGuid();
        }
    }
}




