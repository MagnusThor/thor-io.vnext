import * as net from 'net';

import { Connection } from '../Connection/Connection';
import { ControllerBase } from '../Controller/ControllerBase';
import { ITransport } from '../Interfaces/ITransport';
import { Plugin } from '../Server/Plugin';
import {
  WebSocketMessageTransport,
} from '../Transports/WebSocketMessageTransport';

/**
 * ThorIOServer server class for managing connections and controllers.
 */
export class ThorIOServer {
    /**
     * An array of plugins containing registered controllers.
     */
    private controllers: Map<string, Plugin<ControllerBase>>;
    /**
     * A Map of connections indexed by their ID.
     */
    private connections: Map<string, Connection>;
    /**
     * An array of active net.Server instances representing endpoints.
     */
    private endpoints: Array<net.Server>;
    /**
     * (Optional) Interceptors for custom logic during communication.
     */
    interceptors: any;

    /**
     * Creates a new instance of ThorIOServer.
     *
     * @param {Array<ControllerBase>} controllers An array of controllers to register.
     * @returns {ThorIOServer} A new ThorIOServer instance.
     */
    static createInstance(controllers: Array<any>): ThorIOServer {
        return new ThorIOServer(controllers);
    }

    /**
     * Constructor for ThorIOServer.
     *
     * @param {Array<ControllerBase>} controllers An array of controllers to register.
     */
    constructor(controllers: Array<ControllerBase>) {
        this.endpoints = new Array<net.Server>();
        this.connections = new Map<string, Connection>();
        this.controllers = new Map<string, Plugin<ControllerBase>>();
        controllers.forEach((ctrl: ControllerBase) => {
            if (!Reflect.hasOwnMetadata("alias", ctrl)) {
                throw "Failed to register one of the specified Controllers, missing ControllerProperties alias attribute";
            } else {
                console.log(`Starting registering the '${Reflect.getMetadata("alias", ctrl)}' controller.`);
            }
            const plugin = new Plugin<ControllerBase>(ctrl as ControllerBase);
            this.controllers.set(Reflect.getMetadata("alias", ctrl), plugin);
        });
    }

    /**
     * Removes a connection from the server.
     *
     * @param {string} id The ID of the connection to remove.
     * @param {number} reason The reason for removing the connection.
     */
    removeConnection(id: string, reason: number): void {
        try {
            this.connections.delete(id);
        }
        catch (error) {
            console.warn(`Failed to delete a connection with id ${id}, reason: ${reason}`);
        }
    }

    /**
     * Adds a new endpoint to the server using the specified transport type, host, and port.
     *
     * @param {new (...args: any[]) => ITransport} typeOfTransport A constructor function for the transport type.
     * @param {string} host The hostname or IP address to listen on.
     * @param {number} port The port number to listen on.
     * @returns {net.Server} The created net.Server instance.
     */
    addEndpoint(typeOfTransport: { new(...args: any[]): ITransport; }, host: string, port: number): net.Server {
        const endpoint = net.createServer((socket: net.Socket) => {
            const transport = new typeOfTransport(socket);
            this.addConnection(transport);
        });
        endpoint.listen(port, host, ((listener: any) => {
            // do op
        }));
        this.endpoints.push(endpoint);
        return endpoint;
    }

    /**
     * Adds a WebSocket connection to the server.
     *
     * @param {any} ws The WebSocket object.
     * @param {any} req The request object (if applicable).
     */
    addWebSocket(ws: any, req: any): void {
        const transport = new WebSocketMessageTransport(ws, req);
        this.addConnection(transport);
    }

    /**
     * Adds a new connection to the server's internal state.
     *
     * @param {ITransport} transport The transport object representing the connection.
     */
    private addConnection(transport: ITransport): void {
        transport.addEventListener("close", (reason: number) => {
            if (transport.onClose)
                transport.onClose(reason);
            this.removeConnection(transport.id, reason);
        });
        this.connections.set(transport.id, new Connection(transport, this.connections, this.controllers));
    }
}
