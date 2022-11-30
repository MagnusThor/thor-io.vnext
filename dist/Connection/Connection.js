"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const TextMessage_1 = require("../Messages/TextMessage");
const ClientInfo_1 = require("./ClientInfo");
class Connection {
    methodInvoker(controller, method, data, buffer) {
        try {
            if (!controller.canInvokeMethod(method))
                throw "method '" + method + "' cant be invoked.";
            if (typeof controller[method] === "function") {
                controller[method].apply(controller, [
                    JSON.parse(data),
                    method,
                    controller.alias,
                    buffer,
                ]);
            }
            else {
                let prop = method;
                let propValue = JSON.parse(data);
                if (typeof controller[prop] === typeof propValue)
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
    constructor(transport, connections, controllers) {
        this.transport = transport;
        this.connections = connections;
        this.controllers = controllers;
        this.connections = connections;
        this.controllerInstances = new Map();
        this.errors = new Array();
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
                        let message = TextMessage_1.TextMessage.fromArrayBuffer(event.data);
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
    addError(error) {
        this.errors.push(error);
    }
    hasController(alias) {
        return this.controllerInstances.has(alias);
    }
    removeController(alias) {
        return this.controllerInstances.delete(alias);
    }
    getController(alias) {
        try {
            let match = this.controllerInstances.get(alias);
            if (!match)
                throw `cannot locate the requested controller ${alias}`;
            return match;
        }
        catch (error) {
            this.addError(error);
            return;
        }
    }
    addControllerInstance(controller) {
        this.controllerInstances.set(controller.alias, controller);
        return controller;
    }
    registerSealdController() {
        throw "not yet implemented";
    }
    resolveController(alias) {
        try {
            let resolvedController = this.controllers.find((resolve) => {
                return (resolve.alias === alias &&
                    Reflect.getMetadata("seald", resolve.instance) === false);
            });
            return resolvedController;
        }
        catch (_a) {
            throw `Cannot resolve ${alias},controller unknown.`;
        }
    }
    locateController(alias) {
        try {
            let match = this.getController(alias);
            if (match) {
                return match;
            }
            else {
                let resolved = this.resolveController(alias);
                let controllerInstance = new resolved.instance(this);
                this.addControllerInstance(controllerInstance);
                controllerInstance.invoke(new ClientInfo_1.ClientInfo(this.id, controllerInstance.alias), "___open", controllerInstance.alias);
                if (controllerInstance.onopen)
                    controllerInstance.onopen();
                this.transport.onClose = (e) => {
                    if (controllerInstance.onclose)
                        controllerInstance.onclose();
                };
                return controllerInstance;
            }
        }
        catch (error) {
            this.transport.close(1011, "Cannot locate the specified controller,it may be seald or the the alias in unknown '" +
                alias +
                "'. connection closed");
            return null;
        }
    }
}
exports.Connection = Connection;
