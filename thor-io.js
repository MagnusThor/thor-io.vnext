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
        Reflect.defineMetadata("seald", seald || false, target);
        Reflect.defineMetadata("alias", alias, target);
    };
}
exports.ControllerProperties = ControllerProperties;
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
        Utils.getInstance = function (obj) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var instance = Object.create(obj.prototype);
            instance.constructor.apply(instance, args);
            return instance;
        };
        return Utils;
    }());
    ThorIO.Utils = Utils;
    var Plugin = (function () {
        function Plugin(controller) {
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
                    ThorIO.Utils.getInstance(controller.instance, new ThorIO.Connection(null, _this.connections, _this.controllers));
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
        function Message(topic, object, controller, id) {
            this.D = object;
            this.T = topic;
            this.C = controller;
            this.id = id;
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
            this.connections = connections;
            this.id = ThorIO.Utils.newGuid();
            if (ws) {
                this.ws = ws;
                this.ws["$connectionId"] = this.id;
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
                    throw "method '" + method + "' cant be invoked.";
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(controller, [data, method, controller.alias]);
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
            return controller;
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
                    var controllerInstance = ThorIO.Utils.getInstance(resolved, this);
                    this.addControllerInstance(controllerInstance);
                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), " ___open", controllerInstance.alias);
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
            return Reflect.getMetadata("invokeable", this, method);
        };
        Controller.prototype.findOn = function (alias, predicate) {
            var connections = this.getConnections(alias).map(function (p) {
                return p.getController(alias);
            });
            return connections.filter(predicate);
        };
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
            var msg = new Message("___error", error, this.alias).toString();
            this.invoke(error, "___error", this.alias);
        };
        Controller.prototype.invokeToAll = function (data, topic, controller) {
            var msg = new Message(topic, data, this.alias).toString();
            ;
            this.getConnections().forEach(function (connection) {
                connection.getController(controller).invoke(data, topic, controller);
            });
            return this;
        };
        ;
        Controller.prototype.invokeTo = function (predicate, data, topic, controller) {
            var _this = this;
            var connections = this.findOn(controller, predicate);
            connections.forEach(function (controller) {
                controller.invoke(data, topic, _this.alias);
            });
            return this;
        };
        ;
        Controller.prototype.invoke = function (data, topic, controller) {
            var msg = new Message(topic, data, this.alias);
            if (this.client.ws)
                this.client.ws.send(msg.toString());
            return this;
        };
        ;
        Controller.prototype.publish = function (data, topic, controller) {
            if (!this.hasSubscription(topic))
                return;
            return this.invoke(data, topic, this.alias);
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
            return this;
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
        Controller.prototype.___connect = function () {
        };
        Controller.prototype.___getProperty = function (data) {
            data.value = this[data.name];
            this.invoke(data, "___getProperty", this.alias);
        };
        Controller.prototype.___close = function () {
            this.client.removeController(this.alias);
            this.invoke({}, " ___close", this.alias);
        };
        Controller.prototype.___subscribe = function (subscription, topic, controller) {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            this.subscriptions.push(subscription);
            return subscription;
        };
        ;
        Controller.prototype.___unsubscribe = function (subscription) {
            var index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));
            if (index >= 0) {
                var result = this.subscriptions.splice(index, 1);
                return true;
            }
            else
                return false;
        };
        ;
        __decorate([
            CanSet(false), 
            __metadata('design:type', String)
        ], Controller.prototype, "alias", void 0);
        __decorate([
            CanSet(false), 
            __metadata('design:type', Array)
        ], Controller.prototype, "subscriptions", void 0);
        __decorate([
            CanSet(false), 
            __metadata('design:type', Connection)
        ], Controller.prototype, "client", void 0);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String]), 
            __metadata('design:returntype', Object)
        ], Controller.prototype, "canInvokeMethod", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String, Function]), 
            __metadata('design:returntype', Array)
        ], Controller.prototype, "findOn", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String]), 
            __metadata('design:returntype', Array)
        ], Controller.prototype, "getConnections", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "onopen", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "onclose", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Array, Function, Function]), 
            __metadata('design:returntype', Array)
        ], Controller.prototype, "find", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object]), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "invokeError", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, String, String]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "invokeToAll", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Function, Object, String, String]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "invokeTo", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, String, String]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "invoke", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, String, String]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "publish", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, String, String]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "publishToAll", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String]), 
            __metadata('design:returntype', Boolean)
        ], Controller.prototype, "hasSubscription", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String]), 
            __metadata('design:returntype', Subscription)
        ], Controller.prototype, "getSubscription", null);
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "___connect", null);
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [PropertyMessage]), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "___getProperty", null);
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "___close", null);
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Subscription, String, String]), 
            __metadata('design:returntype', Subscription)
        ], Controller.prototype, "___subscribe", null);
        __decorate([
            CanInvoke(true), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Subscription]), 
            __metadata('design:returntype', Boolean)
        ], Controller.prototype, "___unsubscribe", null);
        return Controller;
    }());
    ThorIO.Controller = Controller;
    var PropertyMessage = (function () {
        function PropertyMessage() {
            this.messageId = ThorIO.Utils.newGuid();
        }
        return PropertyMessage;
    }());
    ThorIO.PropertyMessage = PropertyMessage;
})(ThorIO = exports.ThorIO || (exports.ThorIO = {}));
//# sourceMappingURL=thor-io.js.map