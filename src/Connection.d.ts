import { Plugin } from './Plugin';
import { ClientInfo } from './Client/ClientInfo';
import { ITransport } from './Interfaces/ITransport';
import { ControllerBase } from './Controller/ControllerBase';
export declare class Connection {
    transport: ITransport;
    connections: Array<Connection>;
    private controllers;
    errors: Array<any>;
    pingPongInterval: number;
    controllerInstances: Array<ControllerBase>;
    clientInfo: ClientInfo;
    private methodInvoker;
    readonly id: string;
    constructor(transport: ITransport, connections: Array<Connection>, controllers: Array<Plugin<ControllerBase>>);
    private addError;
    hasController(alias: string): boolean;
    removeController(alias: string): void;
    getController(alias: string): ControllerBase;
    private addControllerInstance;
    private registerSealdController;
    locateController(alias: string): ControllerBase;
}
