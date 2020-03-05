"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Messages/Message");
const ClientInfo_1 = require("./Client/ClientInfo");
class Connection {
    constructor(transport, connections, controllers) {
        this.transport = transport;
        this.connections = connections;
        this.controllers = controllers;
        this.connections = connections;
        this.controllerInstances = new Array();
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
                        let message = Message_1.Message.fromArrayBuffer(event.data);
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
                let resolvedController = this.controllers.find((resolve) => {
                    return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                }).instance;
                let controllerInstance = new resolvedController(this);
                this.addControllerInstance(controllerInstance);
                controllerInstance.invoke(new ClientInfo_1.ClientInfo(this.id, controllerInstance.alias), "___open", controllerInstance.alias);
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
exports.Connection = Connection;
