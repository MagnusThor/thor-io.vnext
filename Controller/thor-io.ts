export namespace ThorIO {



    export class Utils {
        static newGuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }
    }

    export class Plugin {
        public alias: string;
        public instance: any;
        constructor() {
        }
    }
    export class Engine {
        private controllers: Array < Plugin > ;
        private connections: Array < Connection > ;
        private _engine: Engine;
        constructor(controllers: Array < any > ) {
            this._engine = this;
            this.connections = new Array < Connection > ();
            this.controllers = new Array < Plugin > ();
            controllers.forEach((ctrl) => {
                this.controllers.push(ctrl);
            });

        }
        private log(error: any) {
     
        }
        findController(alias: string): Controller {
            var match = this.controllers.filter((pre) => {
                return pre.alias == alias;
            });
            return match[0].instance;
        }

        findConnection(id: string): Connection {
            var match = this.connections.filter((conn) => {
                return conn.id === id;
            });
            return match[0];
        }
        removeConnection(ws: any,reason:number) {
            try {
                var connection = this.connections.filter((pre: Connection) => {
                    return pre.id === ws["$connectionId"];
                })[0];
                var index = this.connections.indexOf(connection);
                if(index >=0)
                this.connections.splice(index, 1);
            } catch (error) {
                // todo: log error
            }
        };
        addConnection(ws: any) {
            this.connections.push(
                new Connection(ws, this.connections, this.controllers)
            );
            ws.on("close",(reason) => {
                     this.removeConnection(ws,reason);
            });

        }
    }

    export class Message {

        public T:string;
        public D:any;
        public C:string;
      
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
        public queue: Array < Message > ;
        public controllerInstances: Array < Controller > ;
        public connections: Array < Connection > ;
        public clientInfo: ThorIO.ClientInfo;


        constructor(ws: WebSocket, connections: Array < Connection > , private controllers: Array < Plugin > ) {

            var self = this;
            this.connections = connections;
            this.id = ThorIO.Utils.newGuid();
            this.ws = ws;
            this.ws["$connectionId"] = this.id;

            this.ws.onmessage = (message: MessageEvent) => {
                var json = JSON.parse(message.data);
                var controller = this.locateController(json.C);
                try {
                    if (!json.T.startsWith("$set_")) {
                        controller[json.T].apply(controller, [JSON.parse(json.D), json.C]);
                    } else {
                        var prop = json.T.replace("$set_", "");
                        controller[prop] = JSON.parse(json.D);
                    }
                } catch (ex) {
                // todo:log error
                // console.log("log the error", JSON.stringify(json))
                }
            };
            this.queue = new Array < Message > ();
            this.controllerInstances = new Array < Controller > ();
        }
        hasController(alias: string): boolean {
            var match = this.controllerInstances.filter((pre: Controller) => {
                return pre.alias == alias;
            });
            return match.length >= 0;
        }

        removeController(alias:string){
                var index = this.controllerInstances.indexOf(this.getController(alias));
                if(index > -1)
                this.controllerInstances.splice(index,1);
        }
        getController(alias: string):Controller {
            try {
                var match = this.controllerInstances.filter((pre: Controller) => {
                    return pre.alias == alias;
                });
                return match[0];
            } catch (error) {
                // todo:log error
                return null
            }
        }

        locateController(alias: string): Controller {
            var match = this.controllerInstances.filter((pre) => {
                return pre.alias === alias;
            });
            if (match.length > 0) {
                return match[0];
            } else {
                var controller = this.controllers.filter((resolve) => {
                    return resolve.alias === alias;
                });
                var resolved = controller[0].instance;
                var controllerInstance = (new resolved(this)) as Controller;
                this.controllerInstances.push(controllerInstance);
                controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "$open_", controllerInstance.alias);
                controllerInstance.onopen();
                return controllerInstance;
            }
        }
    }

    export class Subscription {
        public topic: string;
        public controller: string
        public connectionId: string;
        constructor(topic: string, controller: string,connectionId:string) {
            this.topic = topic;
            this.controller = controller;
            this.connectionId = connectionId;
        }
    }

    export class Controller {
        public alias: string;
        public subscriptions: Array < Subscription > ;
        public client:Connection
        constructor(client: Connection) {
            this.client = client;
            this.subscriptions = new Array < Subscription > ();
        }
        getConnections(alias ? : string) {
         
            return this.client.connections;
        }
        onopen() {
            console.log("onopen");
        }
        invokeToAll(data: any, topic: string, controller: string) {
            var msg = new Message(topic, data, this.alias).toString();
            this.getConnections().forEach((connection: Connection) => {
               // console.log("sending",connection.ws);
                connection.ws.send(msg);
            });
        };
        protected filterControllers(what: Array < Controller > , pre) {
            var arr = what;
            var result = [];
            for (var i = 0; i < arr.length; i++) {
                if (pre(arr[i]))
                    result.push(arr[i]);
            };
            return result;
        }

        invokeTo(expression: Function, data: any, topic: string, controller: string) {
            var connections = this.getConnections().map((pre: Connection) => {
                if (pre.hasController(controller)) return pre.getController(controller);
            });
            var filtered = this.filterControllers(connections, expression);
            filtered.forEach((instance: Controller) => {
                instance.invoke(data, topic, this.alias);
            });
        };
        invoke(data: any, topic: string, controller: string) {
            var msg = new Message(topic, data, this.alias);
            this.client.ws.send(msg.toString());
        };

        subscribe(subscription:Subscription,topic:string,controller:string): Subscription {
          
        
                if (this.hasSubscription(subscription.topic)) {
                    return;
                }
            
            console.log("adding",subscription.topic);
        
            this.subscriptions.push(subscription);

    //        console.log("___",this.subscriptions);

            return null;
        };
        unsubscribe(topic: string) {

            this.subscriptions.splice(0,1);
            // var subscription = this.getSubscription(topic);
            // console.log("subscription",this.subscriptions.length,subscription);
            // var index = this.subscriptions.indexOf(subscription);
            // console.log("index is = ",index);
            // if(index >= 0)
            //     console.log("this.subscriptions",this.subscriptions.length);
            //     this.subscriptions.splice(index, 1);
            //         console.log("this.subscriptions",this.subscriptions.length);
        
        };
        publish(data: any, topic: string, controller: string) {
            if (!this.hasSubscription(topic)) return;
            this.invoke(data, topic, this.alias);
        };
        publishToAll(data: any, topic: string, controller: string){
        var msg = new Message(topic, data, this.alias);
          
            this.getConnections().forEach((connection: Connection) => {

               var controller = connection.getController(this.alias);

                
               if(controller.getSubscription(topic)){
                   console.log(connection.id ," has a sub  for",topic,controller.subscriptions.length);
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
            console.log("try find___", this.subscriptions);
                var subscription = this.subscriptions.filter(
                    (pre: Subscription) => {
                     //   console.log(pre.topic,topic);
                        return pre.topic === topic;
                    }
                );
                console.log("found",subscription);
                return subscription[0];
            }
        // todo: remove this method
        $connect_() {

        // todo: remove this method        
        }
        $close_() {
                this.client.removeController(this.alias);
                this.invoke({},"$close_",this.alias);
        }

    }
}

export class Generic extends ThorIO.Controller {
    public alias: string;
    public clientInfo: any;
    public room: string;
    constructor(client: ThorIO.Connection) {
        super(client);
        this.room = "foo";
        this.alias = "generic";
    }
    sendMessage(data, controller, topic) {
        this.invoke(data, "invoke", this.alias);
        this.invokeToAll(data, "invokeToAll", this.alias);
        var expression =
            (pre: Generic) => {
                if (pre.room === "foo") return pre;
            };

        this.invokeTo(expression, data, "invokeTo", this.alias);
        this.publishToAll(data, "sub", this.alias);
    }
    onopen() {
        console.log("called on open")
    }
    onclose() {
        console.log("called on close")
    }
}