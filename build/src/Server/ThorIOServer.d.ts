import * as net from 'net';
import { Connection } from '../Connection/Connection';
import { ControllerBase } from '../Controller/ControllerBase';
import { ITransport } from '../Interfaces/ITransport';
import { Plugin } from '../Server/Plugin';
/**
 * ThorIOServer server class for managing connections and controllers.
 */
export declare class ThorIOServer {
    /**
     * An array of plugins containing registered controllers.
     */
    controllers: Map<string, Plugin<ControllerBase>>;
    /**
     * A Map of connections indexed by their ID.
     */
    connections: Map<string, Connection>;
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
    /**
     * Publishes a message to all connected clients that are subscribed to the specified topic.
     * @template T - The type of data being published.
     * @param data - The data to publish.
     * @param topic - The topic to publish to.
     * @param controller - The controller handling the message.
     */
    publishToAll<T>(data: T, topic: string, controller: string): void;
    publishTo<T>(connectionId: string, data: T, topic: string, controller: string): void;
    /**
     * Invokes a method on all connected clients for a specific controller and topic.
     *
     * @param data - The data to be sent to each controller's invoke method.
     * @param topic - The topic or event name to be invoked.
     * @param controller - The name of the controller to target on each connection.
     * @param buffer - Optional binary data to be passed along with the invocation.
     */
    invokeToAll<T>(data: T, topic: string, controller: string, buffer?: any): void;
    /**
     * Invokes a method on a connected client.
     * @param connectionId - The unique identifier of the target client connection.
     * @param data - The data payload to send to the client.
     * @param topic - The topic or method name to invoke on the client.
     * @param controller - The name of the controller handling the invocation.
     * @param buffer - Optional buffer data to include with the invocation.
     */
    invokeOnClient<T>(connectionId: string, data: T, topic: string, controller: string, buffer?: any): void;
    /**
     * Finds and returns an array of controllers of the specified type that match the given predicate.
     *
     * @template T - The type of the controller to find.
     * @param controller - The name of the controller to search for.
     * @param predicate - A function that takes a controller instance and returns a boolean indicating whether it matches the criteria.
     * @returns An array of matching `ControllerBase` instances if any are found; otherwise, `undefined`.
     */
    findConnecion<T>(controller: string, predicate: (item: any) => boolean): ControllerBase[] | undefined;
}
