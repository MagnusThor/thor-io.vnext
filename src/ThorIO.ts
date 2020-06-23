import { Plugin } from './Plugin';
import { Connection } from './Connection';
import { WebSocketMessageTransport } from "./Transports/WebSocketMessageTransport";
import { ITransport } from "./Interfaces/ITransport";
import * as net from 'net';
import { ControllerBase } from "./Controller/ControllerBase";
import { IInterceptor } from './Interfaces/IInterceptor';
/**
 * Creates an hosting container / hug
 *
 * @export
 * @class ThorIO
 */
export class ThorIO {
    /**
     *
     *
     * @private
     * @type {Array<Plugin<IController>>}
     * @memberOf ThorIO
     */
    private controllers: Array<Plugin<ControllerBase>>;
    /**
     *
     *
     * @private
     * @type {Array<Connection>}
     * @memberOf ThorIO
     */
    private connections: Map<string,Connection>;
    /**
     *
     *
     * @private
     * @type {Array<any>}
     * @memberOf ThorIO
     */
    private endpoints: Array<any>;
    interceptors: any;
    /**
     * Creates an instance of ThorIO.
     *
     * @param {Array<any>} controllers
     *
     * @memberOf ThorIO
     */
    constructor(controllers: Array<any>,interceptors?:Array<IInterceptor>) {
        this.endpoints = new Array<any>();
        this.connections = new  Map<string,Connection>();
        this.controllers = new Array<Plugin<ControllerBase>>();

        this.interceptors = interceptors; 

        controllers.forEach((ctrl: ControllerBase) => {
            if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                throw "Faild to register on of the specified Controller's";
            }
            let plugin = new Plugin<ControllerBase>(ctrl);
            this.controllers.push(plugin);
        });
    }
    /**
     *
     *
     * @public
     *
     * @memberOf ThorIO
     */
    public createSealdControllers() {
        this.controllers.forEach((controller: Plugin<ControllerBase>) => {
            if (Reflect.getMetadata("seald", controller.instance)) {
                new controller.instance(new Connection(null, 
                   this.connections, this.controllers));
            }
        });
    }
    /**
     *
     *
     * @param {string} id
     * @param {number} reason
     *
     * @memberOf ThorIO
     */
    removeConnection(id: string, reason: number): void {
        try {          
            this.connections.delete(id);                            
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
     * @memberOf ThorIO
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
     * @memberOf ThorIO
     */
    addWebSocket(ws: any, req: any): void {
        let transport = new WebSocketMessageTransport(ws,req);
        this.addConnection(transport);
    }
    /**
     *
     *
     * @private
     * @param {ITransport} transport
     *
     * @memberOf ThorIO
     */
    private addConnection(transport: ITransport): void {
        transport.addEventListener("close", (reason) => {   
            if(transport.onClose)
                    transport.onClose(reason);
            this.removeConnection(transport.id, reason);
        });
        this.connections.set(transport.id,new Connection(transport, this.connections, this.controllers));
    }
}
