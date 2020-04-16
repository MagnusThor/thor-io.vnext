import { Plugin } from './Plugin';
import { ClientInfo } from './Client/ClientInfo';
import { ITransport } from './Interfaces/ITransport';
import { ControllerBase } from './Controller/ControllerBase';
export declare class Connection {
    transport: ITransport;
    connections: Map<string, Connection>;
    private controllers;
    errors: Array<any>;
    pingPongInterval: number;
    controllerInstances: Map<string, ControllerBase>;
    clientInfo: ClientInfo;
    private methodInvoker;
    readonly id: string;
    constructor(transport: ITransport, connections: Map<string, Connection>, controllers: Array<Plugin<ControllerBase>>);
    private addError;
    hasController(alias: string): boolean;
    removeController(alias: string): boolean;
    getController(alias: string): ControllerBase;
    private addControllerInstance;
    private registerSealdController;
    resolveController(alias: string): Plugin<ControllerBase>;
    locateController(alias: string): ControllerBase;
}
