import * as net from 'net';

import { Connection } from '../Connection/Connection';
import { ControllerBase } from '../Controller/ControllerBase';
import { ITransport } from '../Interfaces/ITransport';
import { Plugin } from '../Server/Plugin';
import {
    WebSocketMessageTransport,
} from '../Transports/WebSocketMessageTransport';
import { WebSocketMessage } from '../Messages/WebSocketMessage';
import { TextMessage } from '../Messages/TextMessage';

/**
 * ThorIOServer server class for managing connections and controllers.
 */
export class ThorIOServer {
    /**
     * An array of plugins containing registered controllers.
     */
    public controllers: Map<string, Plugin<ControllerBase>>;
    /**
     * A Map of connections indexed by their ID.
     */
    public connections: Map<string, Connection>;
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

    /**
     * Publishes a message to all connected clients that are subscribed to the specified topic.
     * @template T - The type of data being published.
     * @param data - The data to publish.
     * @param topic - The topic to publish to.
     * @param controller - The controller handling the message.
     */
    publishToAll<T>(data: T, topic: string, controller: string) {
        let msg = new TextMessage(topic, data, controller);
        this.connections.forEach(connection => {
            const ctrl = connection.tryGetController(controller);
            if (ctrl) {
                if (ctrl.getSubscription(topic)) {
                    connection.transport.send(msg.toString());
                }
            }
        });
    }


    publishTo<T>(connectionId: string, data: T, topic: string, controller: string) {
        const connection = this.connections.get(connectionId);
        if (connection!) {
            const ctrl = connection.tryGetController(controller);
            if (ctrl) {
                ctrl.publish(data, topic, controller);
            }
        }
    }


    /**
     * Invokes a method on all connected clients for a specific controller and topic.
     *
     * @param data - The data to be sent to each controller's invoke method.
     * @param topic - The topic or event name to be invoked.
     * @param controller - The name of the controller to target on each connection.
     * @param buffer - Optional binary data to be passed along with the invocation.
     */
    invokeToAll<T>(data: T, topic: string, controller: string, buffer?: any) {
        this.connections.forEach((connection: Connection) => {
            const ctrl = connection.tryGetController(controller);
            if (ctrl) {
                ctrl.invoke(data, topic, controller, buffer);
            }
        });
    }
    /**
     * Invokes a method on a connected client.
     * @param connectionId - The unique identifier of the target client connection.
     * @param data - The data payload to send to the client.
     * @param topic - The topic or method name to invoke on the client.
     * @param controller - The name of the controller handling the invocation.
     * @param buffer - Optional buffer data to include with the invocation.
     */
    invokeOnClient<T>(connectionId: string, data: T, topic: string, controller: string, buffer?: any) {
        const connection = this.connections.get(connectionId);
        if (connection!) {
            let targetController = connection.tryGetController(controller);
            if (targetController) {
                targetController.invoke(data, topic, controller, buffer);
            }
        }
    }



    /**
     * Finds and returns an array of controllers of the specified type that match the given predicate.
     *
     * @template T - The type of the controller to find.
     * @param controller - The name of the controller to search for.
     * @param predicate - A function that takes a controller instance and returns a boolean indicating whether it matches the criteria.
     * @returns An array of matching `ControllerBase` instances if any are found; otherwise, `undefined`.
     */
    findConnecion<T>(controller: string, predicate: (item: any) => boolean): ControllerBase[] | undefined {
        let connections = Array.from(this.connections.values()).map((p: Connection) => {
            return p.tryGetController(controller);
        });
        const result = connections.filter(predicate).filter((c): c is ControllerBase => c !== undefined);
        return result.length > 0 ? result : undefined;
    }

}

