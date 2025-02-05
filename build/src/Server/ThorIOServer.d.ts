import * as net from 'net';
import { ControllerBase } from '../Controller/ControllerBase';
import { ITransport } from '../Interfaces/ITransport';
/**
 * ThorIOServer server class for managing connections and controllers.
 */
export declare class ThorIOServer {
    /**
     * An array of plugins containing registered controllers.
     */
    private controllers;
    /**
     * A Map of connections indexed by their ID.
     */
    private connections;
    /**
     * An array of active net.Server instances representing endpoints.
     */
    private endpoints;
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
    static createInstance(controllers: Array<any>): ThorIOServer;
    /**
     * Constructor for ThorIOServer.
     *
     * @param {Array<ControllerBase>} controllers An array of controllers to register.
     */
    constructor(controllers: Array<ControllerBase>);
    /**
     * Removes a connection from the server.
     *
     * @param {string} id The ID of the connection to remove.
     * @param {number} reason The reason for removing the connection.
     */
    removeConnection(id: string, reason: number): void;
    /**
     * Adds a new endpoint to the server using the specified transport type, host, and port.
     *
     * @param {new (...args: any[]) => ITransport} typeOfTransport A constructor function for the transport type.
     * @param {string} host The hostname or IP address to listen on.
     * @param {number} port The port number to listen on.
     * @returns {net.Server} The created net.Server instance.
     */
    addEndpoint(typeOfTransport: {
        new (...args: any[]): ITransport;
    }, host: string, port: number): net.Server;
    /**
     * Adds a WebSocket connection to the server.
     *
     * @param {any} ws The WebSocket object.
     * @param {any} req The request object (if applicable).
     */
    addWebSocket(ws: any, req: any): void;
    /**
     * Adds a new connection to the server's internal state.
     *
     * @param {ITransport} transport The transport object representing the connection.
     */
    private addConnection;
}
