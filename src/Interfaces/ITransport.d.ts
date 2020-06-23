/// <reference types="node" />
import { ITransportMessage } from "./ITransportMessage";
import { IInterceptor } from "./IInterceptor";
import { IncomingMessage } from 'http';
export interface ITransport {
    id: string;
    socket: any;
    readyState: number;
    send(data: any): any;
    close(reason: number, message: any): any;
    addEventListener(topic: string, fn: Function): any;
    ping(): any;
    onMessage: (message: ITransportMessage) => void;
    onClose: (e: any) => void;
    onOpen: (e: any) => void;
    interceptors: Map<string, IInterceptor>;
    request: IncomingMessage | any;
}
