/// <reference types="node" />
import { ITransport } from "./Interfaces/ITransport";
import * as net from 'net';
import { IInterceptor } from './Interfaces/IInterceptor';
export declare class ThorIO {
    private controllers;
    private connections;
    private endpoints;
    interceptors: any;
    constructor(controllers: Array<any>, interceptors?: Array<IInterceptor>);
    createSealdControllers(): void;
    removeConnection(id: string, reason: number): void;
    addEndpoint(typeOfTransport: {
        new (...args: any[]): ITransport;
    }, host: string, port: number): net.Server;
    addWebSocket(ws: any, req: any): void;
    private addConnection;
}
