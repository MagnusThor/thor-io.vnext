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
const net = require('net');
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
    class Utils {
        static stingToBuffer(str) {
            let len = str.length;
            let arr = new Array(len);
            for (let i = 0; i < len; i++) {
                arr[i] = str.charCodeAt(i) & 0xFF;
            }
            return new Uint8Array(arr);
        }
        static arrayToLong(byteArray) {
            var value = 0;
            for (var i = byteArray.byteLength - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i];
            }
            return value;
        }
        static longToArray(long) {
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
        getInstance(controller, connection) {
            return new controller(connection);
        }
        static getNew(ctor) {
            console.log(ctor);
            return new ctor();
        }
    }
    ThorIO.Utils = Utils;
    class Plugin {
        constructor(controller) {
            this.alias = Reflect.getMetadata("alias", controller);
            this.instance = controller;
        }
    }
    ThorIO.Plugin = Plugin;
    class Engine {
        constructor(controllers) {
            this.endpoints = [];
            this.connections = [];
            this.controllers = [];
            controllers.forEach((ctrl) => {
                if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                    throw "Faild to register on of the specified ThorIO.Controller's";
                }
                var plugin = new Plugin(ctrl);
                this.controllers.push(plugin);
            });
        }
        createSealdControllers() {
            this.controllers.forEach((controller) => {
                if (Reflect.getMetadata("seald", controller.instance)) {
                    ThorIO.Utils.getInstance(controller.instance, new ThorIO.Connection(null, this.connections, this.controllers));
                }
            });
        }
        removeConnection(id, reason) {
            try {
                let connection = this.connections.find((pre) => {
                    return pre.id === id;
                });
                let index = this.connections.indexOf(connection);
                if (index >= 0)
                    this.connections.splice(index, 1);
            }
            catch (error) {
            }
        }
        addEndpoint(typeOfTransport, host, port) {
            let endpoint = net.createServer((socket) => {
                let transport = new typeOfTransport(socket);
                this.addConnection(transport);
            });
            endpoint.listen(port, host, ((listener) => {
            }));
            this.endpoints.push(endpoint);
            return endpoint;
        }
        addWebSocket(ws, req) {
            let transport = new WebSocketMessageTransport(ws);
            this.addConnection(transport);
        }
        addConnection(transport) {
            transport.addEventListener("close", (reason) => {
                this.removeConnection(transport.id, reason);
            });
            this.connections.push(new Connection(transport, this.connections, this.controllers));
        }
    }
    ThorIO.Engine = Engine;
    class Message {
        constructor(topic, data, controller, arrayBuffer) {
            this.D = data;
            this.T = topic;
            this.C = controller;
            this.B = arrayBuffer;
            if (arrayBuffer)
                this.isBinary = true;
        }
        get JSON() {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            };
        }
        ;
        toString() {
            return JSON.stringify(this.JSON);
        }
        static fromArrayBuffer(buffer) {
            let headerLen = 8;
            let header = buffer.slice(0, 8);
            let payloadLength = ThorIO.Utils.arrayToLong(header);
            let message = buffer.slice(headerLen, payloadLength + headerLen);
            let blobOffset = headerLen + payloadLength;
            let blob = buffer.slice(blobOffset, buffer.byteLength);
            let data = JSON.parse(message.toString());
            return new Message(data.T, data.D, data.C, blob);
        }
        toArrayBuffer() {
            let messagePayload = this.toString();
            let payloadLength = messagePayload.length;
            let header = new Buffer(ThorIO.Utils.longToArray(payloadLength));
            let message = new Buffer(payloadLength);
            message.write(messagePayload, 0, payloadLength, "utf-8");
            var blob = new Buffer(this.B);
            var buffer = Buffer.concat([header, message, blob]);
            return buffer;
        }
    }
    ThorIO.Message = Message;
    class Listener {
        constructor(topic, fn) {
            this.fn = fn;
            this.topic = topic;
        }
    }
    ThorIO.Listener = Listener;
    class ClientInfo {
        constructor(ci, controller) {
            this.CI = ci;
            this.C = controller;
            this.TS = new Date();
        }
    }
    ThorIO.ClientInfo = ClientInfo;
    class PipeMessage {
        constructor(data, binary) {
            this.data = data;
            this.binary = binary;
            this.message = JSON.parse(this.data);
            this.arr = new Array();
            this.arr.push(this.message.C);
            this.arr.push(this.message.T);
            this.arr.push(this.message.D);
        }
        toBuffer() {
            return new Buffer(this.arr.join("|"));
        }
        toMessage() {
            return this.message;
        }
    }
    ThorIO.PipeMessage = PipeMessage;
    class BufferMessage {
        constructor(data, binary) {
            this.data = data;
            this.binary = binary;
        }
        toMessage() {
            const headerLen = 3;
            const tLen = this.data.readUInt8(0);
            const cLen = this.data.readUInt8(1);
            const dLen = this.data.readUInt8(2);
            let offset = headerLen;
            const topic = this.data.toString("utf-8", offset, tLen + offset);
            offset += tLen;
            const controller = this.data.toString("utf-8", offset, offset + cLen);
            offset += cLen;
            const data = this.data.toString("utf-8", offset, offset + dLen);
            let message = new ThorIO.Message(topic, data, controller);
            return message;
        }
        toBuffer() {
            let message = JSON.parse(this.data.toString());
            const header = 3;
            let offset = 0;
            const tLen = message.T.length;
            const dLen = message.D.length;
            const cLen = message.C.length;
            let bufferSize = header + tLen + dLen + cLen;
            let buffer = new Buffer(bufferSize);
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
        }
    }
    ThorIO.BufferMessage = BufferMessage;
    class WebSocketMessage {
        constructor(data, binary) {
            this.data = data;
            this.binary = binary;
        }
        toBuffer() {
            throw "not yet implemented";
        }
        toMessage() {
            return JSON.parse(this.data);
        }
    }
    ThorIO.WebSocketMessage = WebSocketMessage;
    class BufferMessageTransport {
        constructor(socket) {
            this.socket = socket;
            this.id = ThorIO.Utils.newGuid();
            this.socket.addListener("data", (buffer) => {
                let bm = new BufferMessage(buffer, false);
                this.onMessage(bm);
            });
        }
        get readyState() {
            return 1;
        }
        send(data) {
            let bm = new BufferMessage(new Buffer(data), false);
            this.socket.write(bm.toBuffer());
        }
        addEventListener(name, fn) {
            this.socket.addListener(name, fn);
        }
        ping() {
            return;
        }
        close() {
            this.socket.destroy();
        }
    }
    ThorIO.BufferMessageTransport = BufferMessageTransport;
    class PipeMessageTransport {
        constructor(socket) {
            this.socket = socket;
            this.id = ThorIO.Utils.newGuid();
            socket.addListener("data", (buffer) => {
                let args = buffer.toString().split("|");
                let message = new Message(args[1], args[2], args[0]);
                this.onMessage(new PipeMessage(message.toString(), false));
            });
        }
        send(data) {
            let message = new PipeMessage(data, false);
            this.socket.write(message.toBuffer());
        }
        close(reason, message) {
            this.socket.destroy();
        }
        addEventListener(name, fn) {
            this.socket.addListener(name, fn);
        }
        get readyState() {
            return 1;
        }
        ping() {
            return;
        }
    }
    ThorIO.PipeMessageTransport = PipeMessageTransport;
    class WebSocketMessageTransport {
        constructor(socket) {
            this.id = ThorIO.Utils.newGuid();
            this.socket = socket;
            this.socket.addEventListener("message", (event) => {
                this.onMessage(new WebSocketMessage(event.data, event.binary));
            });
        }
        ;
        send(data) {
            this.socket.send(data);
        }
        close(reason, message) {
            this.socket.close(reason, message);
        }
        addEventListener(name, fn) {
            this.socket.addEventListener(name, fn);
        }
        get readyState() {
            return this.socket.readyState;
        }
        ping() {
            this.socket["ping"]();
        }
    }
    ThorIO.WebSocketMessageTransport = WebSocketMessageTransport;
    class Connection {
        constructor(transport, connections, controllers) {
            this.transport = transport;
            this.connections = connections;
            this.controllers = controllers;
            this.connections = connections;
            this.controllerInstances = [];
            this.errors = [];
            if (transport) {
                this.transport.onMessage = (event) => {
                    try {
                        if (!event.binary) {
                            let message = event.toMessage();
                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D);
                        }
                        else {
                            let message = Message.fromArrayBuffer(event.data);
                            let controller = this.locateController(message.C);
                            if (controller)
                                this.methodInvoker(controller, message.T, message.D, message.B);
                        }
                    }
                    catch (error) {
                        this.addError(error);
                    }
                };
            }
        }
        methodInvoker(controller, method, data, buffer) {
            try {
                if (!controller.canInvokeMethod(method))
                    throw "method '" + method + "' cant be invoked.";
                if (typeof (controller[method]) === "function") {
                    controller[method].apply(controller, [JSON.parse(data), method,
                        controller.alias, buffer]);
                }
                else {
                    let prop = method;
                    let propValue = JSON.parse(data);
                    if (typeof (controller[prop]) === typeof (propValue))
                        controller[prop] = propValue;
                }
            }
            catch (ex) {
                controller.invokeError(ex);
            }
        }
        get id() {
            return this.transport.id;
        }
        addError(error) {
            this.errors.push(error);
        }
        hasController(alias) {
            let match = this.controllerInstances.filter((pre) => {
                return pre.alias == alias;
            });
            return match.length >= 0;
        }
        removeController(alias) {
            let index = this.controllerInstances.indexOf(this.getController(alias));
            if (index > -1)
                this.controllerInstances.splice(index, 1);
        }
        getController(alias) {
            try {
                let match = this.controllerInstances.filter((pre) => {
                    return pre.alias == alias;
                });
                return match[0];
            }
            catch (error) {
                return null;
            }
        }
        addControllerInstance(controller) {
            this.controllerInstances.push(controller);
            return controller;
        }
        registerSealdController() {
            throw "not yet implemented";
        }
        locateController(alias) {
            try {
                let match = this.controllerInstances.find((pre) => {
                    return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
                });
                if (match) {
                    return match;
                }
                else {
                    let resolved = this.controllers.filter((resolve) => {
                        return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                    })[0].instance;
                    let controllerInstance = ThorIO.Utils.getInstance(resolved, this);
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
        }
    }
    ThorIO.Connection = Connection;
    class Subscription {
        constructor(topic, controller) {
            this.topic = topic;
            this.controller = controller;
        }
    }
    ThorIO.Subscription = Subscription;
    class Controller {
        constructor(connection) {
            this.connection = connection;
            this.subscriptions = [];
            this.alias = Reflect.getMetadata("alias", this.constructor);
            this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);
            if (this.heartbeatInterval >= 1000)
                this.enableHeartbeat();
        }
        new(connection) {
            console.log("called new on Controller", this.alias);
        }
        enableHeartbeat() {
            this.connection.transport.addEventListener("pong", () => {
                this.lastPong = new Date();
            });
            let interval = setInterval(() => {
                this.lastPing = new Date();
                if (this.connection.transport.readyState === 1)
                    this.connection.transport.ping();
            }, this.heartbeatInterval);
        }
        canInvokeMethod(method) {
            return Reflect.getMetadata("canInvokeOrSet", this, method);
        }
        findOn(alias, predicate) {
            let connections = this.getConnections(alias).map((p) => {
                return p.getController(alias);
            });
            return connections.filter(predicate);
        }
        getConnections(alias) {
            if (!alias) {
                return this.connection.connections;
            }
            else {
                return this.connection.connections.map((conn) => {
                    if (conn.hasController(this.alias))
                        return conn;
                });
            }
        }
        onopen() { }
        onclose() { }
        find(array, predicate, selector = (x) => x) {
            return array.filter(predicate).map(selector);
        }
        invokeError(error) {
            let msg = new Message("___error", error, this.alias).toString();
            this.invoke(error, "___error", this.alias);
        }
        invokeToOthers(data, topic, controller, buffer) {
            this.getConnections().filter((pre) => {
                return pre.id !== this.connection.id;
            })
                .forEach((connection) => {
                connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
            });
            return this;
        }
        invokeToAll(data, topic, controller, buffer) {
            this.getConnections().forEach((connection) => {
                connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
            });
            return this;
        }
        invokeTo(predicate, data, topic, controller, buffer) {
            let connections = this.findOn(controller || this.alias, predicate);
            connections.forEach((ctrl) => {
                ctrl.invoke(data, topic, controller || this.alias, buffer);
            });
            return this;
        }
        invoke(data, topic, controller, buffer) {
            let msg = new Message(topic, data, controller || this.alias, buffer);
            if (this.connection.transport)
                this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
            return this;
        }
        publish(data, topic, controller) {
            if (!this.hasSubscription(topic))
                return;
            return this.invoke(data, topic, controller || this.alias);
        }
        publishToAll(data, topic, controller) {
            let msg = new Message(topic, data, this.alias);
            this.getConnections().forEach((connection) => {
                let ctrl = connection.getController(controller || this.alias);
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            });
            return this;
        }
        hasSubscription(topic) {
            let p = this.subscriptions.filter((pre) => {
                return pre.topic === topic;
            });
            return !(p.length === 0);
        }
        addSubscription(topic) {
            let subscription = new Subscription(topic, this.alias);
            return this.___subscribe(subscription, topic, this.alias);
        }
        removeSubscription(topic) {
            return this.___unsubscribe(this.getSubscription(topic));
        }
        getSubscription(topic) {
            let subscription = this.subscriptions.find((pre) => {
                return pre.topic === topic;
            });
            return subscription;
        }
        ___connect() {
        }
        ___close() {
            this.connection.removeController(this.alias);
            this.invoke({}, " ___close", this.alias);
        }
        ___subscribe(subscription, topic, controller) {
            if (this.hasSubscription(subscription.topic)) {
                return;
            }
            this.subscriptions.push(subscription);
            return subscription;
        }
        ;
        ___unsubscribe(subscription) {
            let index = this.subscriptions.indexOf(this.getSubscription(subscription.topic));
            if (index >= 0) {
                let result = this.subscriptions.splice(index, 1);
                return true;
            }
            else
                return false;
        }
        ;
    }
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
    ThorIO.Controller = Controller;
    var Controllers;
    (function (Controllers) {
        class InstantMessage {
        }
        Controllers.InstantMessage = InstantMessage;
        class PeerConnection {
            constructor(context, peerId) {
                this.context = context;
                this.peerId = peerId;
            }
        }
        Controllers.PeerConnection = PeerConnection;
        class Signal {
            constructor(recipient, sender, message) {
                this.recipient = recipient;
                this.sender = sender;
                this.message = message;
            }
        }
        Controllers.Signal = Signal;
        let BrokerController = class BrokerController extends ThorIO.Controller {
            constructor(connection) {
                super(connection);
                this.Connections = [];
            }
            onopen() {
                this.Peer = new PeerConnection(ThorIO.Utils.newGuid(), this.connection.id);
                this.invoke(this.Peer, "contextCreated", this.alias);
            }
            instantMessage(data, topic, controller) {
                var expression = (pre) => {
                    return pre.Peer.context >= this.Peer.context;
                };
                this.invokeTo(expression, data, "instantMessage", this.alias);
            }
            changeContext(change) {
                this.Peer.context = change.context;
                this.invoke(this.Peer, "contextChanged", this.alias);
            }
            contextSignal(signal) {
                let expression = (pre) => {
                    return pre.connection.id === signal.recipient;
                };
                this.invokeTo(expression, signal, "contextSignal", this.alias);
            }
            connectContext() {
                let connections = this.getPeerConnections(this.Peer).map((p) => {
                    return p.Peer;
                });
                this.invoke(connections, "connectTo", this.alias);
            }
            getPeerConnections(peerConnetion) {
                let match = this.findOn(this.alias, (pre) => {
                    return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId;
                });
                return match;
            }
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
        Controllers.BrokerController = BrokerController;
    })(Controllers = ThorIO.Controllers || (ThorIO.Controllers = {}));
})(ThorIO = exports.ThorIO || (exports.ThorIO = {}));
//# sourceMappingURL=thor-io.js.map