import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
import { IInterceptor } from '../Interfaces/IInterceptor';
export declare class WebSocketMessageTransport implements ITransport {
    socket: WebSocket;
    onMessage: (message: ITransportMessage) => void;
    id: string;
    send(data: any): void;
    close(reason: number, message: string): void;
    addEventListener(name: string, fn: any): void;
    constructor(socket: any);
    interceptors: Map<string, IInterceptor>;
    onClose: (ev: any) => void;
    onOpen: (ev: any) => void;
    readonly readyState: number;
    ping(): void;
}
