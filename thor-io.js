"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var net = require('net');
require('reflect-metadata');
function CanInvoke(state) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
exports.CanInvoke = CanInvoke;
function CanSet(state) {
    return function (target, propertyKey) {
        Reflect.defineMetadata("canInvokeOrSet", state, target, propertyKey);
    };
}
exports.CanSet = CanSet;
function ControllerProperties(alias, seald, heartbeatInterval) {
    return function (target) {
        Reflect.defineMetadata("seald", seald || false, target);
        Reflect.defineMetadata("alias", alias, target);
        Reflect.defineMetadata("heartbeatInterval", heartbeatInterval || -1, target);
    };
}
exports.ControllerProperties = ControllerProperties;
var ThorIO;
(function (ThorIO) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.stingToBuffer = function (str) {
            var len = str.length;
            var arr = new Array(len);
            for (var i = 0; i < len; i++) {
                arr[i] = str.charCodeAt(i) & 0xFF;
            }
            return new Uint8Array(arr);
        };
        Utils.arrayToLong = function (byteArray) {
            var value = 0;
            for (var i = byteArray.byteLength - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i];
            }
            return value;
        };
        Utils.longToArray = function (long) {
            var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
            for (var index = 0; index < byteArray.length; index++) {
                var byte = long & 0xff;
                byteArray[index] = byte;
                long = (long - byte) / 256;
            }
            return byteArray;
        };
        Utils.newGuid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        };
        Utils.randomString = function () {
            return Math.random().toString(36).substring(2);
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
            this.endpoints = [];
            this.connections = [];
            this.controllers = [];
            controllers.forEach(function (ctrl) {
                if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                    throw "Faild to register on of the specified ThorIO.Controller's";
                }
                var plugin = new Plugin(ctrl);
                _this.controllers.push(plugin);
            });
        }
        Engine.prototype.createSealdControllers = function () {
            var _this = this;
            this.controllers.forEach(function (controller) {
                if (Reflect.getMetadata("seald", controller.instance)) {
                    new controller.instance(new ThorIO.Connection(null, _this.connections, _this.controllers));
                }
            });
        };
        Engine.prototype.removeConnection = function (id, reason) {
            try {
                var connection = this.connections.find(function (pre) {
                    return pre.id === id;
                });
                var index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            }
            catch (error) {
            }
        };
        Engine.prototype.addEndpoint = function (typeOfTransport, host, port) {
            var _this = this;
            var endpoint = net.createServer(function (socket) {
                var transport = new typeOfTransport(socket);
                _this.addConnection(transport);
            });
            endpoint.listen(port, host, (function (listener) {
            }));
            this.endpoints.push(endpoint);
            return endpoint;
        };
        Engine.prototype.addWebSocket = function (ws, req) {
            var transport = new WebSocketMessageTransport(ws);
            this.addConnection(transport);
        };
        Engine.prototype.addConnection = function (transport) {
            var _this = this;
            transport.addEventListener("close", function (reason) {
                _this.removeConnection(transport.id, reason);
            });
            this.connections.push(new Connection(transport, this.connections, this.controllers));
        };
        return Engine;
    }());
    ThorIO.Engine = Engine;
    var Message = (function () {
        function Message(topic, data, controller, arrayBuffer) {
            this.D = data;
            this.T = topic;
            this.C = controller;
            this.B = arrayBuffer;
            if (arrayBuffer)
                this.isBinary = true;
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
        Message.fromArrayBuffer = function (buffer) {
            var headerLen = 8;
            var header = buffer.slice(0, 8);
            var payloadLength = ThorIO.Utils.arrayToLong(header);
            var message = buffer.slice(headerLen, payloadLength + headerLen);
            var blobOffset = headerLen + payloadLength;
            var blob = buffer.slice(blobOffset, buffer.byteLength);
            var data = JSON.parse(message.toString());
            return new Message(data.T, data.D, data.C, blob);
        };
        Message.prototype.toArrayBuffer = function () {
            var messagePayload = this.toString();
            var payloadLength = messagePayload.length;
            var header = new Buffer(ThorIO.Utils.longToArray(payloadLength));
            var message = new Buffer(payloadLength);
            message.write(messagePayload, 0, payloadLength, "utf-8");
            var blob = new Buffer(this.B);
            var buffer = Buffer.concat([header, message, blob]);
            return buffer;
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
            this.TS = new Date();
        }
        return ClientInfo;
    }());
    ThorIO.ClientInfo = ClientInfo;
    var PipeMessage = (function () {
        function PipeMessage(data, binary) {
            this.data = data;
            this.binary = binary;
            this.message = JSON.parse(this.data);
            this.arr = new Array();
            this.arr.push(this.message.C);
            this.arr.push(this.message.T);
            this.arr.push(this.message.D);
        }
        PipeMessage.prototype.toBuffer = function () {
            return new Buffer(this.arr.join("|"));
        };
        PipeMessage.prototype.toMessage = function () {
            return this.message;
        };
        return PipeMessage;
    }());
    ThorIO.PipeMessage = PipeMessage;
    var BufferMessage = (function () {
        function BufferMessage(data, binary) {
            this.data = data;
            this.binary = binary;
        }
        BufferMessage.prototype.toMessage = function () {
            var headerLen = 3;
            var tLen = this.data.readUInt8(0);
            var cLen = this.data.readUInt8(1);
            var dLen = this.data.readUInt8(2);
            var offset = headerLen;
            var topic = this.data.toString("utf-8", offset, tLen + offset);
            offset += tLen;
            var controller = this.data.toString("utf-8", offset, offset + cLen);
            offset += cLen;
            var data = this.data.toString("utf-8", offset, offset + dLen);
            var message = new ThorIO.Message(topic, data, controller);
            return message;
        };
        BufferMessage.prototype.toBuffer = function () {
            var message = JSON.parse(this.data.toString());
            var header = 3;
            var offset = 0;
            var tLen = message.T.length;
            var dLen = message.D.length;
            var cLen = message.C.length;
            var bufferSize = header + tLen + dLen + cLen;
            var buffer = new Buffer(bufferSize);
            buffer.writeUInt8(tLen, 0);
            buffer.writeUInt8(cLen, 1);
            buffer.writeInt8(dLen, 2);
            offset = header;
            buffer.write(message.T, offset);
            offset += tLen;
            buffer.write(message.C, offset);
            offset += cLen;
            buffer.write(message.D, offset);
            return buffer;
        };
        return BufferMessage;
    }());
    ThorIO.BufferMessage = BufferMessage;
    var WebSocketMessage = (function () {
        function WebSocketMessage(data, binary) {
            this.data = data;
            this.binary = binary;
        }
        WebSocketMessage.prototype.toBuffer = function () {
            throw "not yet implemented";
        };
        WebSocketMessage.prototype.toMessage = function () {
            return JSON.parse(this.data);
        };
        return WebSocketMessage;
    }());
    ThorIO.WebSocketMessage = WebSocketMessage;
    var BufferMessageTransport = (function () {
        function BufferMessageTransport(socket) {
            var _this = this;
            this.socket = socket;
            this.id = ThorIO.Utils.newGuid();
            this.socket.addListener("data", function (buffer) {
                var bm = new BufferMessage(buffer, false);
                _this.onMessage(bm);
            });
        }
        Object.defineProperty(BufferMessageTransport.prototype, "readyState", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        BufferMessageTransport.prototype.send = function (data) {
            var bm = new BufferMessage(new Buffer(data), false);
            this.socket.write(bm.toBuffer());
        };
        BufferMessageTransport.prototype.addEventListener = function (name, fn) {
            this.socket.addListener(name, fn);
        };
        BufferMessageTransport.prototype.ping = function () {
            return;
        };
        BufferMessageTransport.prototype.close = function () {
            this.socket.destroy();
        };
        return BufferMessageTransport;
    }());
    ThorIO.BufferMessageTransport = BufferMessageTransport;
    var PipeMessageTransport = (function () {
        function PipeMessageTransport(socket) {
            var _this = this;
            this.socket = socket;
            this.id = ThorIO.Utils.newGuid();
            socket.addListener("data", function (buffer) {
                var args = buffer.toString().split("|");
                var message = new Message(args[1], args[2], args[0]);
                _this.onMessage(new PipeMessage(message.toString(), false));
            });
        }
        PipeMessageTransport.prototype.send = function (data) {
            var message = new PipeMessage(data, false);
            this.socket.write(message.toBuffer());
        };
        PipeMessageTransport.prototype.close = function (reason, message) {
            this.socket.destroy();
        };
        PipeMessageTransport.prototype.addEventListener = function (name, fn) {
            this.socket.addListener(name, fn);
        };
        Object.defineProperty(PipeMessageTransport.prototype, "readyState", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        PipeMessageTransport.prototype.ping = function () {
            return;
        };
        return PipeMessageTransport;
    }());
    ThorIO.PipeMessageTransport = PipeMessageTransport;
    var WebSocketMessageTransport = (function () {
        function WebSocketMessageTransport(socket) {
            var _this = this;
            this.id = ThorIO.Utils.newGuid();
            this.socket = socket;
            this.socket.addEventListener("message", function (event) {
                _this.onMessage(new WebSocketMessage(event.data, event.binary));
            });
        }
        ;
        WebSocketMessageTransport.prototype.send = function (data) {
            this.socket.send(data);
        };
        WebSocketMessageTransport.prototype.close = function (reason, message) {
            this.socket.close(reason, message);
        };
        WebSocketMessageTransport.prototype.addEventListener = function (name, fn) {
            this.socket.addEventListener(name, fn);
        };
        Object.defineProperty(WebSocketMessageTransport.prototype, "readyState", {
            get: function () {
                return this.socket.readyState;
            },
            enumerable: true,
            configurable: true
        });
        WebSocketMessageTransport.prototype.ping = function () {
            this.socket["ping"]();
        };
        return WebSocketMessageTransport;
    }());
    ThorIO.WebSocketMessageTransport = WebSocketMessageTransport;
    var Connection = (function () {
        function Connection(transport, connections, controllers) {
            var _this = this;
            this.transport = transport;
            this.connections = connections;
            this.controllers = controllers;
            this.connections = connections;
            this.controllerInstances = [];
            this.errors = [];
            if (transport) {
                this.transport.onMessage = function (event) {
                    try {
                        if (!event.binary) {
                            var message = event.toMessage();
                            var controller = _this.locateController(message.C);
                            if (controller)
                                _this.methodInvoker(controller, message.T, message.D);
                        }
                        else {
                            var message = Message.fromArrayBuffer(event.data);
                            var controller = _this.locateController(message.C);
                            if (controller)
                                _this.methodInvoker(controller, message.T, message.D, message.B);
                        }
                    }
                    catch (error) {
                        _this.addError(error);
                    }
                };
            }
        }
        Connection.prototype.methodInvoker = function (controller, method, data, buffer) {
            try {
                if (!controller.canInvokeMethod(method))
                    throw "method '" + method + "' cant be invoked.";
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(controller, [JSON.parse(data), method,
                        controller.alias, buffer]);
                }
                else {
                    var prop = method;
                    var propValue = JSON.parse(data);
                    if (typeof (controller[prop]) === typeof (propValue))
                        controller[prop] = propValue;
                }
            }
            catch (ex) {
                controller.invokeError(ex);
            }
        };
        Object.defineProperty(Connection.prototype, "id", {
            get: function () {
                return this.transport.id;
            },
            enumerable: true,
            configurable: true
        });
        Connection.prototype.addError = function (error) {
            this.errors.push(error);
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
                var match = this.controllerInstances.find(function (pre) {
                    return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
                });
                if (match) {
                    return match;
                }
                else {
                    var resolvedController = this.controllers.filter(function (resolve) {
                        return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                    })[0].instance;
                    var controllerInstance = new resolvedController(this);
                    this.addControllerInstance(controllerInstance);
                    controllerInstance.invoke(new ClientInfo(this.id, controllerInstance.alias), "___open", controllerInstance.alias);
                    controllerInstance.onopen();
                    return controllerInstance;
                }
            }
            catch (error) {
                this.transport.close(1011, "Cannot locate the specified controller,it may be seald or the the alias in unknown '" + alias + "'. connection closed");
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
        function Controller(connection) {
            this.connection = connection;
            this.subscriptions = [];
            this.alias = Reflect.getMetadata("alias", this.constructor);
            this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);
            if (this.heartbeatInterval >= 1000)
                this.enableHeartbeat();
        }
        Controller.prototype.enableHeartbeat = function () {
            var _this = this;
            this.connection.transport.addEventListener("pong", function () {
                _this.lastPong = new Date();
            });
            var interval = setInterval(function () {
                _this.lastPing = new Date();
                if (_this.connection.transport.readyState === 1)
                    _this.connection.transport.ping();
            }, this.heartbeatInterval);
        };
        Controller.prototype.canInvokeMethod = function (method) {
            return Reflect.getMetadata("canInvokeOrSet", this, method);
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
                return this.connection.connections;
            }
            else {
                return this.connection.connections.map(function (conn) {
                    if (conn.hasController(_this.alias))
                        return conn;
                });
            }
        };
        Controller.prototype.onopen = function () { };
        Controller.prototype.onclose = function () { };
        Controller.prototype.find = function (array, predicate, selector) {
            if (selector === void 0) { selector = function (x) { return x; }; }
            return array.filter(predicate).map(selector);
        };
        Controller.prototype.invokeError = function (error) {
            var msg = new Message("___error", error, this.alias).toString();
            this.invoke(error, "___error", this.alias);
        };
        Controller.prototype.invokeToOthers = function (data, topic, controller, buffer) {
            var _this = this;
            this.getConnections().filter(function (pre) {
                return pre.id !== _this.connection.id;
            })
                .forEach(function (connection) {
                connection.getController(controller || _this.alias).invoke(data, topic, controller || _this.alias, buffer);
            });
            return this;
        };
        Controller.prototype.invokeToAll = function (data, topic, controller, buffer) {
            var _this = this;
            this.getConnections().forEach(function (connection) {
                connection.getController(controller || _this.alias).invoke(data, topic, controller || _this.alias, buffer);
            });
            return this;
        };
        Controller.prototype.invokeTo = function (predicate, data, topic, controller, buffer) {
            var _this = this;
            var connections = this.findOn(controller || this.alias, predicate);
            connections.forEach(function (ctrl) {
                ctrl.invoke(data, topic, controller || _this.alias, buffer);
            });
            return this;
        };
        Controller.prototype.invoke = function (data, topic, controller, buffer) {
            var msg = new Message(topic, data, controller || this.alias, buffer);
            if (this.connection.transport)
                this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
            return this;
        };
        Controller.prototype.publish = function (data, topic, controller) {
            if (!this.hasSubscription(topic))
                return;
            return this.invoke(data, topic, controller || this.alias);
        };
        Controller.prototype.publishToAll = function (data, topic, controller) {
            var _this = this;
            var msg = new Message(topic, data, this.alias);
            this.getConnections().forEach(function (connection) {
                var ctrl = connection.getController(controller || _this.alias);
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
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
        Controller.prototype.addSubscription = function (topic) {
            var subscription = new Subscription(topic, this.alias);
            return this.___subscribe(subscription, topic, this.alias);
        };
        Controller.prototype.removeSubscription = function (topic) {
            return this.___unsubscribe(this.getSubscription(topic));
        };
        Controller.prototype.getSubscription = function (topic) {
            var subscription = this.subscriptions.find(function (pre) {
                return pre.topic === topic;
            });
            return subscription;
        };
        Controller.prototype.___connect = function () {
        };
        Controller.prototype.___close = function () {
            this.connection.removeController(this.alias);
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
        ], Controller.prototype, "connection", void 0);
        __decorate([
            CanSet(false), 
            __metadata('design:type', Date)
        ], Controller.prototype, "lastPong", void 0);
        __decorate([
            CanSet(false), 
            __metadata('design:type', Date)
        ], Controller.prototype, "lastPing", void 0);
        __decorate([
            CanSet(false), 
            __metadata('design:type', Number)
        ], Controller.prototype, "heartbeatInterval", void 0);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', []), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "enableHeartbeat", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String]), 
            __metadata('design:returntype', Boolean)
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
            __metadata('design:paramtypes', [Object, String, String, Object]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "invokeToOthers", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, String, String, Object]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "invokeToAll", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Function, Object, String, String, Object]), 
            __metadata('design:returntype', Controller)
        ], Controller.prototype, "invokeTo", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, String, String, Object]), 
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
        ], Controller.prototype, "addSubscription", null);
        __decorate([
            CanInvoke(false), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [String]), 
            __metadata('design:returntype', void 0)
        ], Controller.prototype, "removeSubscription", null);
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
    var Controllers;
    (function (Controllers) {
        var InstantMessage = (function () {
            function InstantMessage() {
            }
            return InstantMessage;
        }());
        Controllers.InstantMessage = InstantMessage;
        var PeerConnection = (function () {
            function PeerConnection(context, peerId) {
                this.context = context;
                this.peerId = peerId;
            }
            return PeerConnection;
        }());
        Controllers.PeerConnection = PeerConnection;
        var Signal = (function () {
            function Signal(recipient, sender, message) {
                this.recipient = recipient;
                this.sender = sender;
                this.message = message;
            }
            return Signal;
        }());
        Controllers.Signal = Signal;
        var BrokerController = (function (_super) {
            __extends(BrokerController, _super);
            function BrokerController(connection) {
                _super.call(this, connection);
                this.Connections = [];
            }
            BrokerController.prototype.onopen = function () {
                this.Peer = new PeerConnection(ThorIO.Utils.newGuid(), this.connection.id);
                this.invoke(this.Peer, "contextCreated", this.alias);
            };
            BrokerController.prototype.instantMessage = function (data, topic, controller) {
                var _this = this;
                var expression = function (pre) {
                    return pre.Peer.context >= _this.Peer.context;
                };
                this.invokeTo(expression, data, "instantMessage", this.alias);
            };
            BrokerController.prototype.changeContext = function (change) {
                this.Peer.context = change.context;
                this.invoke(this.Peer, "contextChanged", this.alias);
            };
            BrokerController.prototype.contextSignal = function (signal) {
                var expression = function (pre) {
                    return pre.connection.id === signal.recipient;
                };
                this.invokeTo(expression, signal, "contextSignal", this.alias);
            };
            BrokerController.prototype.connectContext = function () {
                var connections = this.getPeerConnections(this.Peer).map(function (p) {
                    return p.Peer;
                });
                this.invoke(connections, "connectTo", this.alias);
            };
            BrokerController.prototype.getPeerConnections = function (peerConnetion) {
                var _this = this;
                var match = this.findOn(this.alias, function (pre) {
                    return pre.Peer.context === _this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId;
                });
                return match;
            };
            __decorate([
                CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object, String, String]), 
                __metadata('design:returntype', void 0)
            ], BrokerController.prototype, "instantMessage", null);
            __decorate([
                CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [PeerConnection]), 
                __metadata('design:returntype', void 0)
            ], BrokerController.prototype, "changeContext", null);
            __decorate([
                CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Signal]), 
                __metadata('design:returntype', void 0)
            ], BrokerController.prototype, "contextSignal", null);
            __decorate([
                CanInvoke(true), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', []), 
                __metadata('design:returntype', void 0)
            ], BrokerController.prototype, "connectContext", null);
            BrokerController = __decorate([
                ControllerProperties("contextBroker", false, 7500), 
                __metadata('design:paramtypes', [ThorIO.Connection])
            ], BrokerController);
            return BrokerController;
        }(ThorIO.Controller));
        Controllers.BrokerController = BrokerController;
    })(Controllers = ThorIO.Controllers || (ThorIO.Controllers = {}));
})(ThorIO = exports.ThorIO || (exports.ThorIO = {}));
//# sourceMappingURL=thor-io.js.map