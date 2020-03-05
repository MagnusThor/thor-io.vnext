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
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
const CanInvoke_1 = require("../Decorators/CanInvoke");
const CanSet_1 = require("../Decorators/CanSet");
const Message_1 = require("../Messages/Message");
const Connection_1 = require("../Connection");
const Subscription_1 = require("../Subscription");
const IController_1 = require("../Interfaces/IController");
const ErrorMessage_1 = require("../Messages/ErrorMessage");
;
class ControllerBase {
    constructor(connection) {
        this.connection = connection;
        this.subscriptions = [];
        this.alias = Reflect.getMetadata("alias", this.constructor);
        this.heartbeatInterval = Reflect.getMetadata("heartbeatInterval", this.constructor);
        if (this.heartbeatInterval >= 1000)
            this.enableHeartbeat();
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
    invokeError(ex) {
        let errorMessage = new ErrorMessage_1.ErrorMessage(ex.message);
        this.invoke(errorMessage, "___error", this.alias);
    }
    invokeToOthers(data, topic, controller, buffer) {
        this.getConnections().filter((pre) => {
            return pre.id !== this.connection.id;
        })
            .forEach((connection) => {
            connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
        });
    }
    invokeToAll(data, topic, controller, buffer) {
        this.getConnections().forEach((connection) => {
            connection.getController(controller || this.alias).invoke(data, topic, controller || this.alias, buffer);
        });
    }
    invokeTo(predicate, data, topic, controller, buffer) {
        let connections = this.findOn(controller || this.alias, predicate);
        connections.forEach((ctrl) => {
            ctrl.invoke(data, topic, controller || this.alias, buffer);
        });
    }
    invoke(data, topic, controller, buffer) {
        let msg = new Message_1.Message(topic, data, controller || this.alias, buffer);
        if (this.connection.transport)
            this.connection.transport.send(!msg.isBinary ? msg.toString() : msg.toArrayBuffer());
    }
    publish(data, topic, controller) {
        if (!this.hasSubscription(topic))
            return;
        return this.invoke(data, topic, controller || this.alias);
    }
    publishToAll(data, topic, controller) {
        let msg = new Message_1.Message(topic, data, this.alias);
        this.getConnections().forEach((connection) => {
            let ctrl = connection.getController(controller || this.alias);
            if (ctrl.getSubscription(topic)) {
                connection.transport.send(msg.toString());
            }
        });
    }
    hasSubscription(topic) {
        let p = this.subscriptions.filter((pre) => {
            return pre.topic === topic;
        });
        return !(p.length === 0);
    }
    addSubscription(topic) {
        let subscription = new Subscription_1.Subscription(topic, this.alias);
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
    CanSet_1.CanSet(false),
    __metadata("design:type", String)
], ControllerBase.prototype, "alias", void 0);
__decorate([
    CanSet_1.CanSet(false),
    __metadata("design:type", Array)
], ControllerBase.prototype, "subscriptions", void 0);
__decorate([
    CanSet_1.CanSet(false),
    __metadata("design:type", Connection_1.Connection)
], ControllerBase.prototype, "connection", void 0);
__decorate([
    CanSet_1.CanSet(false),
    __metadata("design:type", Date)
], ControllerBase.prototype, "lastPong", void 0);
__decorate([
    CanSet_1.CanSet(false),
    __metadata("design:type", Date)
], ControllerBase.prototype, "lastPing", void 0);
__decorate([
    CanSet_1.CanSet(false),
    __metadata("design:type", Number)
], ControllerBase.prototype, "heartbeatInterval", void 0);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "enableHeartbeat", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], ControllerBase.prototype, "canInvokeMethod", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Array)
], ControllerBase.prototype, "findOn", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ControllerBase.prototype, "getConnections", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "onopen", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "onclose", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Function, Function]),
    __metadata("design:returntype", Array)
], ControllerBase.prototype, "find", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "invokeError", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "invokeToOthers", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "invokeToAll", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "invokeTo", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "invoke", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", typeof (_a = typeof IController_1.IController !== "undefined" && IController_1.IController) === "function" ? _a : Object)
], ControllerBase.prototype, "publish", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "publishToAll", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Boolean)
], ControllerBase.prototype, "hasSubscription", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Subscription_1.Subscription)
], ControllerBase.prototype, "addSubscription", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "removeSubscription", null);
__decorate([
    CanInvoke_1.CanInvoke(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Subscription_1.Subscription)
], ControllerBase.prototype, "getSubscription", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "___connect", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ControllerBase.prototype, "___close", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Subscription_1.Subscription, String, String]),
    __metadata("design:returntype", Subscription_1.Subscription)
], ControllerBase.prototype, "___subscribe", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Subscription_1.Subscription]),
    __metadata("design:returntype", Boolean)
], ControllerBase.prototype, "___unsubscribe", null);
exports.ControllerBase = ControllerBase;
