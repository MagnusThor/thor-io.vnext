"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var net = require("net");
require("reflect-metadata");
function CanInvoke(state) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata("invokeable", state, target, propertyKey);
    };
}
exports.CanInvoke = CanInvoke;
function CanSet(state) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("invokeable", state, target, propertyKey);
    };
}
exports.CanSet = CanSet;
function ControllerProperties(alias, seald) {
    return function (target) {
        Reflect.defineMetadata("alias", alias, target);
        Reflect.defineMetadata("seald", seald || false, target);
    };
}
exports.ControllerProperties = ControllerProperties;
var ThorIO;
(function (ThorIO) {
    // todo: Finalize this thing , that enables raw ( rudimentary clients ) to connect , 
    // in other words non ws/wss speaking clients to connect..
    var EndPoint = (function () {
        function EndPoint(port, fn) {
            this.fn = fn;
            var self = this;
            var server = net.createServer(function (socket) {
                socket.onmessage = function (event) { };
                socket.send = function (data) {
                    socket.write(self.deserializeMessage(data));
                };
                socket.on("data", function (data) {
                    var message = self.serializeMessage(data.toString());
                    socket["onmessage"].apply(socket, [{
                            data: message
                        }]);
                });
                self.fn(socket);
            });
            server.listen(port);
        }
        EndPoint.prototype.serializeMessage = function (data) {
            var parts = data.split("|");
            return new ThorIO.Message(parts[0], parts[2] || {}, parts[1]).toString();
        };
        ;
        EndPoint.prototype.deserializeMessage = function (data) {
            var message = JSON.parse(data);
            var parts = new Array();
            parts.push = message.C;
            parts.push = message.T;
            parts.push = message.D;
            return parts.join("|");
        };
        return EndPoint;
    }());
    ThorIO.EndPoint = EndPoint;
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
        function Plugin(controller) {
            // todo , throw if metaData not exists...
            this.alias = Reflect.getMetadata("alias", controller);
            this.instance = controller;
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
                var plugin = new Plugin(ctrl);
                _this.controllers.push(plugin);
            });
            this.createSealdControllers();
        }
        Engine.prototype.createSealdControllers = function () {
            var _this = this;
            this.controllers.forEach(function (controller) {
                if (Reflect.getMetadata("seald", controller.instance)) {
                    new controller.instance(new ThorIO.Connection(null, _this.connections, _this.controllers));
                }
            });
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
    // todo: refactor this, implememt PI for a sticky session?
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
            this.connections = connections;
            this.id = ThorIO.Utils.newGuid();
            // todo: Ugly , fuzzy due to the "seald" controllers, find a way / workaround..
            if (ws) {
                this.ws = ws;
                this.ws["$connectionId"] = this.id; // todo: replace this
                this.ws.onmessage = function (message) {
                    var json = JSON.parse(message.data);
                    var controller = _this.locateController(json.C);
                    _this.methodInvoker(controller, json.T, JSON.parse(json.D));
                };
            }
            this.controllerInstances = new Array();
        }
        Connection.prototype.methodInvoker = function (controller, method, data) {
            try {
                if (!controller.canInvokeMethod(method))
                    throw "method " + method + "cant be invoked.";
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(controller, [data, controller.alias]);
                }
                else {
                    var prop = method;
                    var propValue = data;
                    if (typeof (controller[prop]) === typeof (propValue))
                        controller[prop] = propValue;
                }
            }
            catch (ex) {
                controller.invokeError(ex);
            }
        };
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
        // todo: refactor and improve..
        Connection.prototype.getController = function (alias) {
            try {
                var match = this.controllerInstances.filter(function (pre) {
                    return pre.alias == alias;
                });
                return match[0];
            }
            catch (error) {
                return null;
            }
        };
        Connection.prototype.addControllerInstance = function (controller) {
            this.controllerInstances.push(controller);
        };
        Connection.prototype.registerSealdController = function () {
            throw "not yet implemented";
        };
        Connection.prototype.locateController = function (alias) {
            try {
                var match = this.controllerInstances.filter(function (pre) {
                    return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
                });
                if (match.length > 0) {
                    return match[0];
                }
                else {
                    var resolved = this.controllers.filter(function (resolve) {
                        return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                    })[0].instance;
                    // hmm  fix this ... 
                    var controllerInstance = (new resolved(this));
                    this.addControllerInstance(controllerInstance);
                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "$open_", controllerInstance.alias);
                    controllerInstance.onopen();
                    return controllerInstance;
                }
            }
            catch (error) {
                this.ws.close(1011, "Cannot locate the specified controller, unknown i seald.'" + alias + "'. Connection closed");
                return null;
            }
        };
        return Connection;
    }());
    ThorIO.Connection = Connection;
    // maybe use EventEmitters, a bit fuzzy ? Comments?? 
    var Subscription = (function () {
        function Subscription(topic, controller) {
            this.topic = topic;
            this.controller = controller;
        }
        return Subscription;
    }());
    ThorIO.Subscription = Subscription;
    var Controller = (function () {
        function Controller(client) {
            this.client = client;
            this.subscriptions = new Array();
            this.alias = Reflect.getMetadata("alias", this.constructor);
        }
        Controller.prototype.canInvokeMethod = function (method) {
            return global.Reflect.getMetadata("invokeable", this, method);
        };
        // todo: refine ( would be happt to discuess with UlfBjo)
        Controller.prototype.findOn = function (alias, predicate) {
            var connections = this.getConnections(alias).map(function (p) {
                return p.getController(alias);
            });
            return connections.filter(predicate);
        };
        //todo: find better name...
        Controller.prototype.getConnections = function (alias) {
            var _this = this;
            if (!alias) {
                return this.client.connections;
            }
            else {
                return this.client.connections.map(function (conn) {
                    if (conn.hasController(_this.alias))
                        return conn;
                });
            }
        };
        Controller.prototype.onopen = function () {
        };
        Controller.prototype.onclose = function () {
        };
        Controller.prototype.find = function (array, predicate, selector) {
            if (selector === void 0) { selector = function (x) { return x; }; }
            return array.filter(predicate).map(selector);
        };
        Controller.prototype.invokeError = function (error) {
            var msg = new Message("$error_", error, this.alias).toString();
            this.invoke(error, "$error_", this.alias);
        };
        Controller.prototype.invokeToAll = function (data, topic, controller) {
            var msg = new Message(topic, data, this.alias).toString();
            this.getConnections().forEach(function (connection) {
                connection.getController(controller).invoke(data, topic, controller);
            });
        };
        ;
        Controller.prototype.invokeTo = function (predicate, data, topic, controller) {
            var _this = this;
            var connections = this.findOn(controller, predicate);
            connections.forEach(function (controller) {
                controller.invoke(data, topic, _this.alias);
            });
        };
        ;
        Controller.prototype.invoke = function (data, topic, controller) {
            var msg = new Message(topic, data, this.alias);
            if (this.client.ws)
                this.client.ws.send(msg.toString());
        };
        ;
        Controller.prototype.subscribe = function (subscription, topic, controller) {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            this.subscriptions.push(subscription);
            return subscription;
        };
        ;
        Controller.prototype.unsubscribe = function (subscription) {
            var index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));
            if (index >= 0) {
                var result = this.subscriptions.splice(index, 1);
                return true;
            }
            else
                return false;
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
                return pre.topic === topic;
            });
            return subscription[0];
        };
        Controller.prototype.$connect_ = function () {
            // todo: remove this method        
        };
        Controller.prototype.$close_ = function () {
            this.client.removeController(this.alias);
            this.invoke({}, "$close_", this.alias);
        };
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "$connect_", null);
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "$close_", null);
        return Controller;
    }());
    ThorIO.Controller = Controller;
})(ThorIO = exports.ThorIO || (exports.ThorIO = {}));
//# sourceMappingURL=thor-io.js.map