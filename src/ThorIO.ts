import { Plugin } from './Plugin';
import { Connection } from "./Connection";
import { WebSocketMessageTransport } from "./Transports/WebSocketMessageTransport";
import { ITransport } from "./Interfaces/ITransport";
import * as net from 'net';
import { ControllerBase } from './Controller/ControllerBase';
/**
 *
 *
 * @export
 * @class Engine
 */
export class ThorIO {
    /**
     *
     *
     * @private
     * @type {Array<Plugin<IController>>}
     * @memberOf Engine
     */
    private controllers: Array<Plugin<ControllerBase>>;
    /**
     *
     *
     * @private
     * @type {Array<Connection>}
     * @memberOf Engine
     */
    private connections: Array<Connection>;
    /**
     *
     *
     * @private
     * @type {Array<any>}
     * @memberOf Engine
     */
    private endpoints: Array<any>;
    /**
     * Creates an instance of Engine.
     *
     * @param {Array<any>} controllers
     *
     * @memberOf Engine
     */
    constructor(controllers: Array<any>) {
        this.endpoints = [];
        this.connections = [];
        this.controllers = [];
        controllers.forEach((ctrl: ControllerBase) => {
            if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                throw "Faild to register on of the specified Controller's";
            }
            var plugin = new Plugin<ControllerBase>(ctrl);
            this.controllers.push(plugin);
        });
    }
    /**
     *
     *
     * @public
     *
     * @memberOf Engine
     */
    public createSealdControllers() {
        this.controllers.forEach((controller: Plugin<ControllerBase>) => {
            if (Reflect.getMetadata("seald", controller.instance)) {
                new controller.instance(new Connection(null, this.connections, this.controllers));
            }
        });
    }
    /**
     *
     *
     * @param {string} id
     * @param {number} reason
     *
     * @memberOf Engine
     */
    removeConnection(id: string, reason: number): void {
        try {
            /**
             *
             *
             * @param {Connection} pre
             * @returns
             */
            let connection = this.connections.find((pre: Connection) => {
                return pre.id === id;
            });
            let index = this.connections.indexOf(connection);
            if (index >= 0)
                this.connections.splice(index, 1);
        }
        catch (error) {
        }
    }
    /**
     *
     *
     * @param {{ new (...args: any[]): ITransport; }} typeOfTransport
     * @param {string} host
     * @param {number} port
     * @returns {net.Server}
     *
     * @memberOf Engine
     */
    addEndpoint(typeOfTransport: {
        new(...args: any[]): ITransport;
    }, host: string, port: number): net.Server {
        /**
         *
         *
         * @param {net.Socket} socket
         */
        let endpoint = net.createServer((socket: net.Socket) => {
            let transport = new typeOfTransport(socket);
            this.addConnection(transport);
        });
        endpoint.listen(port, host, ((listener: any) => {
            // do op
        }));
        this.endpoints.push(endpoint);
        return endpoint;
    }
    /**
     *
     *
     * @param {*} ws
     * @param {*} req
     *
     * @memberOf Engine
     */
    addWebSocket(ws: any, req: any): void {
        let transport = new WebSocketMessageTransport(ws);
        this.addConnection(transport);
    }
    /**
     *
     *
     * @private
     * @param {ITransport} transport
     *
     * @memberOf Engine
     */
    private addConnection(transport: ITransport): void {
        transport.addEventListener("close", (reason) => {
            this.removeConnection(transport.id, reason);
        });
        this.connections.push(new Connection(transport, this.connections, this.controllers));
    }
}
