import { Plugin } from "../Plugin";
import { TextMessage } from "../Messages/TextMessage";
import { ITransport } from "../Interfaces/ITransport";
import { ITransportMessage } from "../Interfaces/ITransportMessage";
import { ControllerBase } from "../Controller/ControllerBase";
import { ClientInfo } from "./ClientInfo";

/**
 *
 *
 * @export
 * @class Connection
 */
export class Connection {
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
  //public controllerInstances: Array<ControllerBase>;
  public controllerInstances: Map<string, ControllerBase>;
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
  private methodInvoker(
    controller: ControllerBase,
    method: string,
    data: string,
    buffer?: any
  ) {
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
      } else {
        let prop = method;
        let propValue = JSON.parse(data);
        if (typeof controller[prop] === typeof propValue)
          controller[prop] = propValue;
      }
    } catch (ex) {
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
  constructor(
    public transport: ITransport,
    public connections: Map<string, Connection>,
    private controllers: Array<Plugin<ControllerBase>>
  ) {
    this.connections = connections;
    //this.controllerInstances = new Array<ControllerBase>();
    this.controllerInstances = new Map<string, ControllerBase>();
    this.errors = new Array<any>();
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
          } else {
            let message = TextMessage.fromArrayBuffer(event.data);
            let controller = this.locateController(message.C);
            if (controller)
              this.methodInvoker(controller, message.T, message.D, message.B);
          }
        } catch (error) {
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
    // let match = this.controllerInstances.filter((pre: ControllerBase) => {
    //     return pre.alias == alias;
    // });
    // return match.length >= 0;
    return this.controllerInstances.has(alias);
  }
  /**
   *
   *
   * @param {string} alias
   *
   * @memberOf Connection
   */
  removeController(alias: string): boolean {
    // let index = this.controllerInstances.indexOf(this.getController(alias));
    // if (index > -1)
    //     this.controllerInstances.splice(index, 1);
    return this.controllerInstances.delete(alias);
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
      let match = this.controllerInstances.get(alias);
      if (!match) throw `cannot locate the requested controller ${alias}`;
      return match;
    } catch (error) {
      this.addError(error);
      return;
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
    this.controllerInstances.set(controller.alias, controller);
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

  public resolveController(alias: string): Plugin<ControllerBase> {
    try {
      let resolvedController = this.controllers.find(
        (resolve: Plugin<ControllerBase>) => {
          return (
            resolve.alias === alias &&
            Reflect.getMetadata("seald", resolve.instance) === false
          );
        }
      );
      return resolvedController;
    } catch {
      throw `Cannot resolve ${alias},controller unknown.`;
    }
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
      let match = this.getController(alias);
      if (match) {
        return match;
      } else {
        // let resolvedController = this.controllers.find((resolve: Plugin<ControllerBase>) => {
        //     return resolve.alias === alias && Reflect.getMetadata("seald", resolve.instance) === false;
        // }).instance;
        let resolved = this.resolveController(alias);
        let controllerInstance = new resolved.instance(this);
        this.addControllerInstance(controllerInstance);
        controllerInstance.invoke(
          new ClientInfo(this.id, controllerInstance.alias),
          "___open",
          controllerInstance.alias
        );
        if (controllerInstance.onopen) controllerInstance.onopen();
        this.transport.onClose = (e: any) => {
          if (controllerInstance.onclose) controllerInstance.onclose();
        };

        return controllerInstance;
      }
    } catch (error) {
      this.transport.close(
        1011,
        "Cannot locate the specified controller,it may be seald or the the alias in unknown '" +
          alias +
          "'. connection closed"
      );
      return null;
    }
  }
}
