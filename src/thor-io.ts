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
        constructor() {}
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
                        if (typeof(controller[json.T] === "function"))
                            controller[json.T].apply(controller, [JSON.parse(json.D), json.C]);
                    } else {
                        var prop = json.T.replace("$set_", "");
                        var propValue = JSON.parse(json.D)
                       if (typeof(controller[prop]) === typeof(propValue))
                            controller[prop] = propValue;
                    }
                } catch (ex) {
                    // todo:log error
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
                // todo:log error
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
            } catch (error) {
                // todo: log error
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
        }
        getConnections(alias ? : string) {
            return this.client.connections;
        }
        onopen() {}
        invokeToAll(data: any, topic: string, controller: string) {
            var msg = new Message(topic, data, this.alias).toString();
            this.getConnections().forEach((connection: Connection) => {
                connection.ws.send(msg);
            });
        };
        private filterControllers(what: Array < Controller > , pre) {
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
            // todo: remove this method
        $connect_() {

            // todo: remove this method        
        }
        $close_() {
            this.client.removeController(this.alias);
            this.invoke({}, "$close_", this.alias);
        }

    }
}