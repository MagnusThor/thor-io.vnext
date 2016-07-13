import net = require("net");
import "reflect-metadata";

export function CanInvoke(state:boolean) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
         Reflect.defineMetadata("invokeable", state, target, propertyKey);
    }    
}
export function CanSet(state:boolean){
    return function(target: Object, propertyKey: string ){
         Reflect.defineMetadata("invokeable", state, target, propertyKey);
    }
}
export function ControllerProperties(alias:string){
        return function(target:Function){
            Reflect.defineMetadata("alias",alias,target);
        }
}

export namespace ThorIO {

    export class EndPoint {
        private serializeMessage(data: string): string {
            var parts = data.split("|");
            return new ThorIO.Message(parts[0], parts[2] || {}, parts[1]).toString();
        };
        private deserializeMessage(data: any): string {
            var message = JSON.parse(data);
            var parts = new Array < string > ();
            parts.push = message.C;
            parts.push = message.T;
            parts.push = message.D;
            return parts.join("|");
        }
        constructor(port: number, private fn ? : Function) {
            var self = this;
            var server: net.Server = net.createServer(function(socket: any) {
                socket.onmessage = function(event: MessageEvent) {};
                socket.send = function(data: ThorIO.Message) {
                    socket.write(self.deserializeMessage(data));
                }
                socket.on("data", (data: any) => {
                    var message = self.serializeMessage(data.toString());
                    socket["onmessage"].apply(socket, [{
                        data: message
                    }]);
                });
                self.fn(socket);
            });
            server.listen(port);
        }
    }

    export class Utils {
        static newGuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }
    }

    export class Plugin<T> {
        public alias: string;
        public instance: T;
        constructor(controller:T) {
            this.alias = Reflect.getMetadata("alias",controller)
            this.instance = controller;
        }
        
    }
    export class Engine {
        private controllers: Array < Plugin<Controller> > 
        private connections: Array < Connection > ;
        private _engine: Engine;
        constructor(controllers: Array < any > ) {
            this._engine = this;
            this.connections = new Array < Connection > ();
            this.controllers = new Array < Plugin<Controller> > ();
            controllers.forEach((ctrl:Controller) => {
                var plugin = new Plugin<Controller>(ctrl);
                this.controllers.push(plugin);
            });
        }
        removeConnection(ws: any, reason: number) {
            try {
                var connection = this.connections.filter((pre: Connection) => {
                    return pre.id === ws["$connectionId"];
                })[0];
                var index = this.connections.indexOf(connection);
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

        public T: string;
        public D: any;
        public C: string;

        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        constructor(topic: string, object: any, controller: string) {
            this.D = object;
            this.T = topic;
            this.C = controller;
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
    export class ClientInfo {
        public CI: string;
        public C: string;
        constructor(ci: string, controller: string) {
            this.CI = ci;
            this.C = controller;
        }
    }


    export class Connection {

        public id: string;
        public ws: WebSocket;
       
        public controllerInstances: Array < ThorIO.Controller > ;
        public connections: Array <ThorIO.Connection> ;
        public clientInfo: ThorIO.ClientInfo;

        private methodInvoker(controller: Controller, method: string, data: any) {
            try {
                    if(!controller.canInvokeMethod(method)) 
                        throw "method " + method + "cant be invoked."
                    if (typeof(controller[method]) === "function"){
                        controller[method].apply(controller, [data, controller.alias]);

                } else {
                    var prop = method;
                    var propValue = data;
                    if (typeof(controller[prop]) === typeof(propValue))
                        controller[prop] = propValue;
                }
            } catch (ex) {
                controller.invokeError(ex);
            }
        }

        constructor(ws: WebSocket, connections: Array < Connection > , private controllers: Array < Plugin<Controller> > ) {

            this.connections = connections;
            this.id = ThorIO.Utils.newGuid();
            this.ws = ws;
            this.ws["$connectionId"] = this.id;

            this.ws.onmessage = (message: MessageEvent) => {
                var json = JSON.parse(message.data);
                var controller = this.locateController(json.C);
                this.methodInvoker(controller, json.T, JSON.parse(json.D));
            };
            this.controllerInstances = new Array < Controller > ();
        }
        hasController(alias: string): boolean {
            var match = this.controllerInstances.filter((pre: Controller) => {
                return pre.alias == alias;
            });
            return match.length >= 0;
        }

        removeController(alias: string) {
            var index = this.controllerInstances.indexOf(this.getController(alias));
            if (index > -1)
                this.controllerInstances.splice(index, 1);
        }

        getController(alias: string): Controller {
            try {
                var match = this.controllerInstances.filter((pre: Controller) => {
                    return pre.alias == alias;
                });
                return match[0];
            } catch (error) {
                return null
            }
        }

        locateController(alias: string): Controller {
            try {
                var match = this.controllerInstances.filter((pre) => {
                    return pre.alias === alias;
                });
                if (match.length > 0) {
                    return match[0];
                } else {
                    var resolved = this.controllers.filter((resolve) => {
                        return resolve.alias === alias;
                    })[0].instance;

                    var controllerInstance = <Controller>new resolved(this); // todo: fix..

                    this.controllerInstances.push(controllerInstance);
                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "$open_", controllerInstance.alias);
                    controllerInstance.onopen();
                    return controllerInstance as Controller;
                }
            } catch (error) {
                this.ws.close(1011, "Cannot locate the specified controller '" + alias + "'. Connection closed")
                return null;
            }
        }
    }

    export class Subscription {
        public topic: string;
        public controller: string

        constructor(topic: string, controller: string) {
            this.topic = topic;
            this.controller = controller;
        }
    }
  
    export class Controller {
        public alias: string;
        public subscriptions: Array < Subscription > ;
        public client: Connection
        constructor(client: Connection) {
            this.client = client;
            this.subscriptions = new Array < Subscription > ();
            this.alias = Reflect.getMetadata("alias",this.constructor);
        }
        public canInvokeMethod(method: string): any {
            return ( < any > global).Reflect.getMetadata("invokeable", this, method);
        }
        getConnections(alias ? : string) {
            return this.client.connections;
        }
        onopen() {}
        onclose() {}
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector: (item: T) => U = (x:T)=> <U><any>x): U[] {
            return array.filter(predicate).map(selector);
        }

        invokeError(error:any){
             var msg = new Message("$error_", error, this.alias).toString();
             this.client.ws.send(msg.toString());
        }

        invokeToAll(data: any, topic: string, controller: string) {
            var msg = new Message(topic, data, this.alias).toString();
            this.getConnections().forEach((connection: Connection) => {
                connection.ws.send(msg);
            });
        };

        invokeTo(expression: (item: Controller) => boolean, data: any, topic: string, controller: string) {
            var connections = this.getConnections().map((pre: Connection) => {
                if (pre.hasController(controller)) return pre.getController(controller);
            });
           connections.filter(expression).forEach( (i:Controller) => {
                 i.invoke(data, topic, this.alias);
           });
        };

        invoke(data: any, topic: string, controller: string) {
            var msg = new Message(topic, data, this.alias);
            this.client.ws.send(msg.toString());
        };

        subscribe(subscription: Subscription, topic: string, controller: string): Subscription {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            this.subscriptions.push(subscription);
            return subscription;
        };

        unsubscribe(subscription: Subscription): boolean {
            var index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));
            if (index >= 0) {
                var result = this.subscriptions.splice(index, 1);
                return true;
            } else
                return false;
        };
        publish(data: any, topic: string, controller: string) {
            if (!this.hasSubscription(topic)) return;
            this.invoke(data, topic, this.alias);
        };
        publishToAll(data: any, topic: string, controller: string) {
            var msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection: Connection) => {
                var controller = connection.getController(this.alias);
                if (controller.getSubscription(topic)) {
                    connection.ws.send(msg.toString());
                }
            });
        }
        public hasSubscription(topic: string): boolean {
            var p = this.subscriptions.filter(
                (pre: Subscription) => {
                    return pre.topic === topic
                }
            );
            return !(p.length === 0);
        }
        public getSubscription(topic: string): Subscription {
                var subscription = this.subscriptions.filter(
                    (pre: Subscription) => {
                        return pre.topic === topic;
                    }
                );
                return subscription[0];
            }
        @CanInvoke(true)
        $connect_() {
            // todo: remove this method        
        }
        @CanInvoke(true)
        $close_() {
            this.client.removeController(this.alias);
            this.invoke({}, "$close_", this.alias);
        }

    }
}





