import { Plugin } from './Plugin';
import { ClientInfo } from './Client/ClientInfo';
import { ITransport } from './Interfaces/ITransport';
import { IController } from "./Interfaces/IController";
export declare class Connection {
    transport: ITransport;
    connections: Array<Connection>;
    private controllers;
    errors: Array<any>;
    pingPongInterval: number;
    controllerInstances: Array<IController>;
    clientInfo: ClientInfo;
    private methodInvoker;
    readonly id: string;
    constructor(transport: ITransport, connections: Array<Connection>, controllers: Array<Plugin<IController>>);
    private addError;
    hasController(alias: string): boolean;
    removeController(alias: string): void;
    getController(alias: string): IController;
    private addControllerInstance;
    private registerSealdController;
    locateController(alias: string): IController;
}
