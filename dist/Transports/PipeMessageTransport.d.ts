/// <reference types="node" />
import { ITransport } from '../Interfaces/ITransport';
import { PipeMessage } from '../Messages/PipeMessage';
import * as net from 'net';
import { IInterceptor } from '../Interfaces/IInterceptor';
export declare class PipeMessageTransport implements ITransport {
    socket: net.Socket;
    id: string;
    onMessage: (message: PipeMessage) => void;
    send(data: any): void;
    close(reason: number, message: any): void;
    addEventListener(name: string, fn: any): void;
    get readyState(): number;
    ping(): void;
    constructor(socket: net.Socket);
    request: any;
    interceptors: Map<string, IInterceptor>;
    onClose: () => void;
    onOpen: () => void;
}
