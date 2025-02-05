import { ControllerBase } from '../Controller/ControllerBase';
import { ITransport } from '../Interfaces/ITransport';
import { Plugin } from '../Server/Plugin';
import { ClientInfo } from './ClientInfo';
export declare class Connection {
    transport: ITransport;
    connections: Map<string, Connection>;
    private controllers;
    /**
     * An array to store errors.
     * @public
     * @type {Array<any>}
     */
    errors: Array<any>;
    /**
     * The ping pong interval.
     * @public
     * @type {number}
     */
    pingPongInterval: number;
    /**
     * A map to store the controller instances.
     * @public
     * @type {Map<string, ControllerBase>}
     */
    controllerInstances: Map<string, ControllerBase>;
    /**
     * Client information.
     * @public
     * @type {ClientInfo | undefined}
     */
    clientInfo: ClientInfo | undefined;
    /**
     * Tries to invoke a method or set/get a property on the controller.
     * @private
     * @param {ControllerBase} controller The controller instance.
     * @param {string} methodOrProperty The method or property name.
     * @param {string} data The data to be passed to the method or property.
     * @param {Buffer} [buffer] An optional buffer.
     */
    private tryInvokeMethod;
    /**
     * Getter for the connection ID.
     * @public
     * @returns {string} The connection ID.
     */
    get id(): string;
    /**
     * Constructor for the Connection class.
     * @param {ITransport} transport The transport instance.
     * @param {Map<string, Connection>} connections A map of connections.
     * @param {Map<string, Plugin<ControllerBase>>} controllers A map of controllers.
     * @constructor
     */
    constructor(transport: ITransport, connections: Map<string, Connection>, controllers: Map<string, Plugin<ControllerBase>>);
    /**
     * Sets up the transport event listeners.
     * @private
     * @param {ITransport} transport The transport instance.
     */
    private setupTransport;
    /**
     * Adds an error to the errors array.
     * @private
     * @param {any} error The error to be added.
     */
    private addError;
    /**
     * Checks if a controller with the given alias exists.
     * @public
     * @param {string} alias The controller alias.
     * @returns {boolean} True if the controller exists, false otherwise.
     */
    hasController(alias: string): boolean;
    /**
     * Removes a controller from the controllerInstances.
     * @public
     * @param {string} alias The alias of the controller to be removed.
     * @returns {boolean} True if the controller was removed successfully, false otherwise.
     */
    tryRemoveControllerInstance(alias: string): boolean;
    /**
     * Gets a controller instance from the controllerInstances map.
     * @public
     * @param {string} alias The alias of the controller to be retrieved.
     * @returns {ControllerBase | undefined} The controller instance if found, otherwise undefined.
     */
    tryGetController(alias: string): ControllerBase | undefined;
    /**
     * Adds a controller instance to the controllerInstances map.
     * @private
     * @param {ControllerBase} controller The controller instance to be added.
     * @returns {ControllerBase} The added controller instance.
     */
    private addControllerInstance;
    /**
     * Finds and resolves a controller by alias.
     * @public
     * @param {string} alias The alias of the controller to be resolved.
     * @returns {ControllerBase} The resolved controller instance.
     * @throws {Error} If the controller cannot be resolved.
     */
    tryResolveController(alias: string): ControllerBase;
    /**
     * Locates a controller by alias. If registered, returns it; otherwise, creates an instance.
     * @public
     * @param {string} alias The alias of the controller to be located.
     * @returns {ControllerBase | undefined} The located controller instance, or undefined if not found.
     */
    tryCreateControllerInstance(alias: string): ControllerBase | undefined;
    /**
     * Initializes a newly created controller instance.
     * @private
     * @param {ControllerBase} controllerInstance The controller instance to initialize.
     */
    private initializeControllerInstance;
}
