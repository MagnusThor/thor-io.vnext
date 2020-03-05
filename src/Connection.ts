import { Plugin } from './Plugin';
import { Message } from './Messages/Message';
import { ClientInfo } from './Client/ClientInfo';
import { ITransport } from './Interfaces/ITransport';
import { ITransportMessage } from './Interfaces/ITransportMessage';
import { ControllerBase } from './Controller/ControllerBase';
/**
 *
 *
 * @export
 * @class Connection
 */
export class Connection{
    /**
     *
     *
     * @type {Array<any>}
     * @memberOf Connection
     */
    public errors: Array<any>;
    /**
     *
     *
     * @type {number}
     * @memberOf Connection
     */
    public pingPongInterval: number;
    /**
     *
     *
     * @type {Array<Controller>}
     * @memberOf Connection
     */
    public controllerInstances: Array<ControllerBase>;
    /**
     *
     *
     * @type {ClientInfo}
     * @memberOf Connection
     */
    public clientInfo: ClientInfo;
    /**
     *
     *
     * @private
     * @param {ControllerBase} controller
     * @param {string} method
     * @param {string} data
     * @param {*} [buffer]
     *
     * @memberOf Connection
     */
    private methodInvoker(controller: ControllerBase, method: string, data: string, buffer?: any) {
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
    /**
     *
     *
     * @readonly
     * @type {string}
     * @memberOf Connection
     */
    get id(): string {
        return this.transport.id;
    }
    /**
     * Creates an instance of Connection.
     *
     * @param {ITransport} transport
     * @param {Array<Connection>} connections
     * @param {Array<Plugin<ControllerBase>>} controllers
     *
     * @memberOf Connection
     */
    constructor(public transport: ITransport, public connections: Array<Connection>, private controllers: Array<Plugin<ControllerBase>>) {
        this.connections = connections;
        this.controllerInstances = new Array<ControllerBase>();
        this.errors = [];
        if (transport) {
            /**
             *
             *
             * @param {ITransportMessage} event
             */
            this.transport.onMessage = (event: ITransportMessage) => {
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
    /**
     *
     *
     * @private
     * @param {*} error
     *
     * @memberOf Connection
     */
    private addError(error: any) {
        this.errors.push(error);
    }
    /**
     *
     *
     * @param {string} alias
     * @returns {boolean}
     *
     * @memberOf Connection
     */
    hasController(alias: string): boolean {
        /**
         *
         *
         * @param {ControllerBase} pre
         * @returns
         */
        let match = this.controllerInstances.filter((pre: ControllerBase) => {
            return pre.alias == alias;
        });
        return match.length >= 0;
    }
    /**
     *
     *
     * @param {string} alias
     *
     * @memberOf Connection
     */
    removeController(alias: string) {
        let index = this.controllerInstances.indexOf(this.getController(alias));
        if (index > -1)
            this.controllerInstances.splice(index, 1);
    }
    /**
     *
     *
     * @param {string} alias
     * @returns {ControllerBase}
     *
     * @memberOf Connection
     */
    getController(alias: string): ControllerBase {
        try {
            /**
             *
             *
             * @param {ControllerBase} pre
             * @returns
             */
            let match = this.controllerInstances.filter((pre: ControllerBase) => {
                return pre.alias == alias;
            });
            return match[0];
        }
        catch (error) {
            return null;
        }
    }
    /**
     *
     *
     * @private
     * @param {ControllerBase} controller
     * @returns {ControllerBase}
     *
     * @memberOf Connection
     */
    private addControllerInstance(controller: ControllerBase): ControllerBase {
        this.controllerInstances.push(controller);
        return controller;
    }
    /**
     *
     *
     * @private
     *
     * @memberOf Connection
     */
    private registerSealdController() {
        throw "not yet implemented";
    }
    /**
     *
     *
     * @param {string} alias
     * @returns {ControllerBase}
     *
     * @memberOf Connection
     */
    locateController(alias: string): ControllerBase {
        try {
            /**
             *
             *
             * @param {ControllerBase} pre
             * @returns
             */
            let match = this.controllerInstances.find((pre: ControllerBase) => {
                return pre.alias === alias && Reflect.getMetadata("seald", pre.constructor) === false;
            });
            if (match) {
                return match;
            }
            else {
                /**
                 *
                 *
                 * @param {Plugin<ControllerBase>} resolve
                 * @returns
                 */
                let resolvedController = this.controllers.find((resolve: Plugin<ControllerBase>) => {
                    return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
                }).instance;

                let controllerInstance = new resolvedController(this);
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
