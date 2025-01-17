"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const TextMessage_1 = require("../Messages/TextMessage");
const ClientInfo_1 = require("./ClientInfo");
class Connection {
    /**
     * Tries to invoke a method or set/get a property on the controller.
     * @private
     * @param {ControllerBase} controller The controller instance.
     * @param {string} methodOrProperty The method or property name.
     * @param {string} data The data to be passed to the method or property.
     * @param {Buffer} [buffer] An optional buffer.
     */
    tryInvokeMethod(controller, methodOrProperty, data, buffer) {
        if (controller.canInvokeMethod(methodOrProperty)) {
            controller.invokeMethod(methodOrProperty, data, buffer);
        }
        else if (controller.canSetProperty(methodOrProperty)) {
            controller.setProperty(methodOrProperty, JSON.parse(data));
        }
        else if (controller.canGetProperty(methodOrProperty)) {
            const { resultId } = JSON.parse(data);
            controller.getProperty(methodOrProperty, resultId);
        }
    }
    /**
     * Getter for the connection ID.
     * @public
     * @returns {string} The connection ID.
     */
    get id() {
        return this.transport.id;
    }
    /**
     * Constructor for the Connection class.
     * @param {ITransport} transport The transport instance.
     * @param {Map<string, Connection>} connections A map of connections.
     * @param {Map<string, Plugin<ControllerBase>>} controllers A map of controllers.
     * @constructor
     */
    constructor(transport, connections, controllers) {
        this.transport = transport;
        this.connections = connections;
        this.controllers = controllers;
        /**
         * An array to store errors.
         * @public
         * @type {Array<any>}
         */
        this.errors = [];
        /**
         * The ping pong interval.
         * @public
         * @type {number}
         */
        this.pingPongInterval = 60;
        /**
         * A map to store the controller instances.
         * @public
         * @type {Map<string, ControllerBase>}
         */
        this.controllerInstances = new Map();
        this.setupTransport(transport);
    }
    /**
     * Sets up the transport event listeners.
     * @private
     * @param {ITransport} transport The transport instance.
     */
    setupTransport(transport) {
        if (transport) {
            this.transport.onMessage = (event) => {
                try {
                    const message = event.isBinary ? TextMessage_1.TextMessage.fromArrayBuffer(event.data) : event.toMessage();
                    const controller = this.tryCreateControllerInstance(message.C);
                    if (controller) {
                        this.tryInvokeMethod(controller, message.T, message.D, message.B);
                    }
                }
                catch (error) {
                    this.addError(error);
                }
            };
        }
    }
    /**
     * Adds an error to the errors array.
     * @private
     * @param {any} error The error to be added.
     */
    addError(error) {
        this.errors.push(error);
    }
    /**
     * Checks if a controller with the given alias exists.
     * @public
     * @param {string} alias The controller alias.
     * @returns {boolean} True if the controller exists, false otherwise.
     */
    hasController(alias) {
        return this.controllerInstances.has(alias);
    }
    /**
     * Removes a controller from the controllerInstances.
     * @public
     * @param {string} alias The alias of the controller to be removed.
     * @returns {boolean} True if the controller was removed successfully, false otherwise.
     */
    tryRemoveControllerInstance(alias) {
        return this.controllerInstances.delete(alias);
    }
    /**
     * Gets a controller instance from the controllerInstances map.
     * @public
     * @param {string} alias The alias of the controller to be retrieved.
     * @returns {ControllerBase | undefined} The controller instance if found, otherwise undefined.
     */
    tryGetController(alias) {
        try {
            const match = this.controllerInstances.get(alias);
            if (!match)
                throw new Error(`Cannot locate the requested controller ${alias}`);
            return match;
        }
        catch (error) {
            this.addError(error);
            return undefined;
        }
    }
    /**
     * Adds a controller instance to the controllerInstances map.
     * @private
     * @param {ControllerBase} controller The controller instance to be added.
     * @returns {ControllerBase} The added controller instance.
     */
    addControllerInstance(controller) {
        if (!controller.alias)
            throw `Cannot add Controller instance`;
        this.controllerInstances.set(controller.alias, controller);
        return controller;
    }
    /**
     * Finds and resolves a controller by alias.
     * @public
     * @param {string} alias The alias of the controller to be resolved.
     * @returns {ControllerBase} The resolved controller instance.
     * @throws {Error} If the controller cannot be resolved.
     */
    tryResolveController(alias) {
        const plugin = this.controllers.get(alias);
        if (!plugin) {
            throw new Error(`Cannot resolve ${alias}, controller unknown.`);
        }
        return plugin.getInstance();
    }
    /**
     * Locates a controller by alias. If registered, returns it; otherwise, creates an instance.
     * @public
     * @param {string} alias The alias of the controller to be located.
     * @returns {ControllerBase | undefined} The located controller instance, or undefined if not found.
     */
    tryCreateControllerInstance(alias) {
        try {
            let instancedController = this.tryGetController(alias);
            if (instancedController) {
                return instancedController;
            }
            else {
                const resolvedController = this.tryResolveController(alias);
                const controllerInstance = new resolvedController(this);
                this.addControllerInstance(controllerInstance);
                this.initializeControllerInstance(controllerInstance);
                return controllerInstance;
            }
        }
        catch (error) {
            console.log(error);
            this.transport.close(1011, `Cannot locate the specified controller, it may be sealed or the alias is unknown '${alias}'. Connection closed.`);
            return undefined;
        }
    }
    /**
     * Initializes a newly created controller instance.
     * @private
     * @param {ControllerBase} controllerInstance The controller instance to initialize.
     */
    initializeControllerInstance(controllerInstance) {
        controllerInstance.invoke(new ClientInfo_1.ClientInfo(this.id, controllerInstance.alias), '___open', controllerInstance.alias);
        if (controllerInstance.onopen)
            controllerInstance.onopen();
        this.transport.onClose = (e) => {
            if (controllerInstance.onclose)
                controllerInstance.onclose();
        };
    }
}
exports.Connection = Connection;
