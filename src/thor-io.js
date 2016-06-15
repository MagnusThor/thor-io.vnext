"use strict";
var ThorIO;
(function (ThorIO) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.newGuid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        };
        return Utils;
    }());
    ThorIO.Utils = Utils;
    var Plugin = (function () {
        function Plugin() {
        }
        return Plugin;
    }());
    ThorIO.Plugin = Plugin;
    var Engine = (function () {
        function Engine(controllers) {
            var _this = this;
            this._engine = this;
            this.connections = new Array();
            this.controllers = new Array();
            controllers.forEach(function (ctrl) {
                _this.controllers.push(ctrl);
            });
        }
        Engine.prototype.log = function (error) {
        };
        Engine.prototype.findController = function (alias) {
            var match = this.controllers.filter(function (pre) {
                return pre.alias == alias;
            });
            return match[0].instance;
        };
        Engine.prototype.findConnection = function (id) {
            var match = this.connections.filter(function (conn) {
                return conn.id === id;
            });
            return match[0];
        };
        Engine.prototype.removeConnection = function (ws, reason) {
            try {
                var connection = this.connections.filter(function (pre) {
                    return pre.id === ws["$connectionId"];
                })[0];
                var index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            }
            catch (error) {
            }
        };
        ;
        Engine.prototype.addConnection = function (ws) {
            var _this = this;
            this.connections.push(new Connection(ws, this.connections, this.controllers));
            ws.on("close", function (reason) {
                _this.removeConnection(ws, reason);
            });
        };
        return Engine;
    }());
    ThorIO.Engine = Engine;
    var Message = (function () {
        function Message(topic, object, controller) {
            this.D = object;
            this.T = topic;
            this.C = controller;
        }
        Object.defineProperty(Message.prototype, "JSON", {
            get: function () {
                return {
                    T: this.T,
                    D: JSON.stringify(this.D),
                    C: this.C
                };
            },
            enumerable: true,
            configurable: true
        });
        ;
        Message.prototype.toString = function () {
            return JSON.stringify(this.JSON);
        };
        return Message;
    }());
    ThorIO.Message = Message;
    var Listener = (function () {
        function Listener(topic, fn) {
            this.fn = fn;
            this.topic = topic;
        }
        return Listener;
    }());
    ThorIO.Listener = Listener;
    var ClientInfo = (function () {
        function ClientInfo(ci, controller) {
            this.CI = ci;
            this.C = controller;
        }
        return ClientInfo;
    }());
    ThorIO.ClientInfo = ClientInfo;
    var Connection = (function () {
        function Connection(ws, connections, controllers) {
            var _this = this;
            this.controllers = controllers;
            var self = this;
            this.connections = connections;
            this.id = ThorIO.Utils.newGuid();
            this.ws = ws;
            this.ws["$connectionId"] = this.id;
            this.ws.onmessage = function (message) {
                var json = JSON.parse(message.data);
                var controller = _this.locateController(json.C);
                try {
                    if (!json.T.startsWith("$set_")) {
                        if (typeof (controller[json.T] === "function"))
                            controller[json.T].apply(controller, [JSON.parse(json.D), json.C]);
                    }
                    else {
                        var prop = json.T.replace("$set_", "");
                        var propValue = JSON.parse(json.D);
                        if (typeof (prop) === typeof (propValue))
                            controller[prop] = propValue;
                    }
                }
                catch (ex) {
                }
            };
            this.queue = new Array();
            this.controllerInstances = new Array();
        }
        Connection.prototype.hasController = function (alias) {
            var match = this.controllerInstances.filter(function (pre) {
                return pre.alias == alias;
            });
            return match.length >= 0;
        };
        Connection.prototype.removeController = function (alias) {
            var index = this.controllerInstances.indexOf(this.getController(alias));
            if (index > -1)
                this.controllerInstances.splice(index, 1);
        };
        Connection.prototype.getController = function (alias) {
            try {
                var match = this.controllerInstances.filter(function (pre) {
                    return pre.alias == alias;
                });
                return match[0];
            }
            catch (error) {
                // todo:log error
                return null;
            }
        };
        Connection.prototype.locateController = function (alias) {
            try {
                var match = this.controllerInstances.filter(function (pre) {
                    return pre.alias === alias;
                });
                if (match.length > 0) {
                    return match[0];
                }
                else {
                    var controller = this.controllers.filter(function (resolve) {
                        return resolve.alias === alias;
                    });
                    var resolved = controller[0].instance;
                    var controllerInstance = (new resolved(this));
                    this.controllerInstances.push(controllerInstance);
                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "$open_", controllerInstance.alias);
                    controllerInstance.onopen();
                    return controllerInstance;
                }
            }
            catch (error) {
                // todo: log error
                this.ws.close(1011, "Cannot locate the specified controller '" + alias + "'. Connection closed");
                return null;
            }
        };
        return Connection;
    }());
    ThorIO.Connection = Connection;
    var Subscription = (function () {
        function Subscription(topic, controller, connectionId) {
            this.topic = topic;
            this.controller = controller;
            this.connectionId = connectionId;
        }
        return Subscription;
    }());
    ThorIO.Subscription = Subscription;
    var Controller = (function () {
        function Controller(client) {
            this.client = client;
            this.subscriptions = new Array();
        }
        Controller.prototype.getConnections = function (alias) {
            return this.client.connections;
        };
        Controller.prototype.onopen = function () {
        };
        Controller.prototype.invokeToAll = function (data, topic, controller) {
            var msg = new Message(topic, data, this.alias).toString();
            this.getConnections().forEach(function (connection) {
                // console.log("sending",connection.ws);
                connection.ws.send(msg);
            });
        };
        ;
        Controller.prototype.filterControllers = function (what, pre) {
            var arr = what;
            var result = [];
            for (var i = 0; i < arr.length; i++) {
                if (pre(arr[i]))
                    result.push(arr[i]);
            }
            ;
            return result;
        };
        Controller.prototype.invokeTo = function (expression, data, topic, controller) {
            var _this = this;
            var connections = this.getConnections().map(function (pre) {
                if (pre.hasController(controller))
                    return pre.getController(controller);
            });
            var filtered = this.filterControllers(connections, expression);
            filtered.forEach(function (instance) {
                instance.invoke(data, topic, _this.alias);
            });
        };
        ;
        Controller.prototype.invoke = function (data, topic, controller) {
            var msg = new Message(topic, data, this.alias);
            this.client.ws.send(msg.toString());
        };
        ;
        Controller.prototype.subscribe = function (subscription, topic, controller) {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            console.log("adding", subscription.topic);
            this.subscriptions.push(subscription);
            //        console.log("___",this.subscriptions);
            return null;
        };
        ;
        Controller.prototype.unsubscribe = function (topic) {
            this.subscriptions.splice(0, 1);
            // var subscription = this.getSubscription(topic);
            // console.log("subscription",this.subscriptions.length,subscription);
            // var index = this.subscriptions.indexOf(subscription);
            // console.log("index is = ",index);
            // if(index >= 0)
            //     console.log("this.subscriptions",this.subscriptions.length);
            //     this.subscriptions.splice(index, 1);
            //         console.log("this.subscriptions",this.subscriptions.length);
        };
        ;
        Controller.prototype.publish = function (data, topic, controller) {
            if (!this.hasSubscription(topic))
                return;
            this.invoke(data, topic, this.alias);
        };
        ;
        Controller.prototype.publishToAll = function (data, topic, controller) {
            var _this = this;
            var msg = new Message(topic, data, this.alias);
            this.getConnections().forEach(function (connection) {
                var controller = connection.getController(_this.alias);
                if (controller.getSubscription(topic)) {
                    connection.ws.send(msg.toString());
                }
            });
        };
        Controller.prototype.hasSubscription = function (topic) {
            var p = this.subscriptions.filter(function (pre) {
                return pre.topic === topic;
            });
            return !(p.length === 0);
        };
        Controller.prototype.getSubscription = function (topic) {
            var subscription = this.subscriptions.filter(function (pre) {
                //   console.log(pre.topic,topic);
                return pre.topic === topic;
            });
            return subscription[0];
        };
        // todo: remove this method
        Controller.prototype.$connect_ = function () {
            // todo: remove this method        
        };
        Controller.prototype.$close_ = function () {
            this.client.removeController(this.alias);
            this.invoke({}, "$close_", this.alias);
        };
        return Controller;
    }());
    ThorIO.Controller = Controller;
})(ThorIO = exports.ThorIO || (exports.ThorIO = {}));
//# sourceMappingURL=thor-io.js.map