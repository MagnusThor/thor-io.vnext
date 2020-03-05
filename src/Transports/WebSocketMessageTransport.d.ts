import { ITransport } from '../Interfaces/ITransport';
import { ITransportMessage } from '../Interfaces/ITransportMessage';
export declare class WebSocketMessageTransport implements ITransport {
    socket: WebSocket;
    onMessage: (message: ITransportMessage) => void;
    id: string;
    send(data: any): void;
    close(reason: number, message: string): void;
    addEventListener(name: string, fn: any): void;
    constructor(socket: any);
    readonly readyState: number;
    ping(): void;
}
