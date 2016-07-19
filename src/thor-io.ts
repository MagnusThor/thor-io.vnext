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
export function ControllerProperties(alias:string,seald?:boolean){
        return function(target:Function){
            Reflect.defineMetadata("alias",alias,target);
            Reflect.defineMetadata("seald",seald || false,target);
        }
}

export namespace ThorIO {

    export class EndPoint {
        private serializeMessage(data: string): string {
            let parts = data.split("|");
            return new ThorIO.Message(parts[0], parts[2] || {}, parts[1]).toString();
        };
        private deserializeMessage(data: any): string {
            let message = JSON.parse(data);
            let parts = new Array < string > ();
            parts.push = message.C;
            parts.push = message.T;
            parts.push = message.D;
            return parts.join("|");
        }
        constructor(port: number, private fn ? : Function) {
            let self = this;
            let server: net.Server = net.createServer(function(socket: any) {
                socket.onmessage = function(event: MessageEvent) {};
                socket.send = function(data: ThorIO.Message) {
                    socket.write(self.deserializeMessage(data));
                }
                socket.on("data", (data: any) => {
                    let message = self.serializeMessage(data.toString());
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
                let plugin = new Plugin<Controller>(ctrl);
                this.controllers.push(plugin);
            });

            this.createSealdControllers();
            
        }
        private createSealdControllers(){
            this.controllers.forEach( (controller:Plugin<Controller>) => {
                if(Reflect.getMetadata("seald",controller.instance)) {
                    <Controller>new controller.instance(new ThorIO.Connection(null,this.connections, this.controllers));
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
                    let prop = method;
                    let propValue = data;
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
            if(ws){

            this.ws = ws;
            this.ws["$connectionId"] = this.id;

            this.ws.onmessage = (message: MessageEvent) => {
                let json = JSON.parse(message.data);
                let controller = this.locateController(json.C);
                this.methodInvoker(controller, json.T, JSON.parse(json.D));
            };
            }
            
            this.controllerInstances = new Array < Controller > ();
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

        private addControllerInstance(controller:Controller){
            this.controllerInstances.push(controller);
        }

        private registerSealdController(){
            throw "not yet implemented";
        }

        locateController(alias: string): Controller {
            try {
                let match = this.controllerInstances.filter((pre:Controller) => {
                    return pre.alias === alias && Reflect.getMetadata("seald",pre.constructor) === false;
                });

                if (match.length > 0) {
                    return match[0];
                } else {
                    
                    let resolved = this.controllers.filter((resolve:Plugin<Controller>) => {
                        return resolve.alias === alias &&  Reflect.getMetadata("seald",resolve.instance) === false;
                    })[0].instance;

                    let controllerInstance = <Controller>(new resolved(this));

                    this.addControllerInstance(controllerInstance);

                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "$open_", controllerInstance.alias);
                    controllerInstance.onopen();

                    return controllerInstance as Controller;
                }
            } catch (error) {
                this.ws.close(1011, "Cannot locate the specified controller, unknown i seald.'" + alias + "'. Connection closed")
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

        // todo: refine
        findOn<T>(alias:string,predicate:(item: any) => boolean):Array<any>{
            let connections = this.getConnections(alias).map( (p:Connection) =>{
                    return p.getController(alias);
            });
            return connections.filter(predicate);
        }
        //todo: find better name...
        getConnections(alias?: string): Array<Connection> {
            if (!alias) {
                return this.client.connections;
            }
            else {
                return this.client.connections.map((conn: Connection) => {
                    if (conn.hasController(this.alias))
                        return conn;
                })
            }
        }
        onopen() {

        }
        onclose() {

        }
        find<T, U>(array: T[], predicate: (item: any) => boolean, selector: (item: T) => U = (x:T)=> <U><any>x): U[] {
            return array.filter(predicate).map(selector);
        }
        invokeError(error:any){
            let msg = new Message("$error_", error, this.alias).toString();
            this.invoke(error,"$error_",this.alias);
        }

        invokeToAll(data: any, topic: string, controller: string) {
            let msg = new Message(topic, data, this.alias).toString();
            this.getConnections().forEach((connection: Connection) => {
               connection.getController(controller).invoke(data,topic,controller);
              
            });
        };

        invokeTo(predicate: (item: Controller) => boolean, data: any, topic: string, controller?: string) {
            // let connections = this.getConnections().map((pre: Connection) => {
            //     if (pre.hasController(controller)) return pre.getController(controller);
            // });
            let connections = this.findOn(controller,predicate);
           connections.forEach( (controller:Controller) => {
                 controller.invoke(data, topic, this.alias);
           });
        };

        invoke(data: any, topic: string, controller: string) {
            let msg = new Message(topic, data, this.alias);
            if(this.client.ws)
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
            let index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));
            if (index >= 0) {
                let result = this.subscriptions.splice(index, 1);
                return true;
            } else
                return false;
        };
        publish(data: any, topic: string, controller: string) {
            if (!this.hasSubscription(topic)) return;
            this.invoke(data, topic, this.alias);
        };
        publishToAll(data: any, topic: string, controller: string) {
            let msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection: Connection) => {
                let controller = connection.getController(this.alias);
                if (controller.getSubscription(topic)) {
                    connection.ws.send(msg.toString());
                }
            });
        }
        public hasSubscription(topic: string): boolean {
            let p = this.subscriptions.filter(
                (pre: Subscription) => {
                    return pre.topic === topic
                }
            );
            return !(p.length === 0);
        }
        public getSubscription(topic: string): Subscription {
                let subscription = this.subscriptions.filter(
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





