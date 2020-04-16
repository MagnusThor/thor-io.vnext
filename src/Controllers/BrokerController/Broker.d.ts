import { Connection } from '../../Connection';
import { PeerConnection } from './Models/PeerConnection';
import { Signal } from './Models/Signal';
import { ControllerBase } from '../../Controller/ControllerBase';
export interface IControllerBase {
    onopen(e: any): void;
    onclose(e: any): void;
}
export declare class BrokerController extends ControllerBase implements IControllerBase {
    Connections: Array<PeerConnection>;
    Peer: PeerConnection;
    localPeerId: string;
    Signal: any;
    constructor(connection: Connection);
    onopen(): void;
    instantMessage(data: any, topic: string, controller: string): void;
    changeContext(change: PeerConnection): void;
    contextSignal(signal: Signal): void;
    connectContext(): void;
    getPeerConnections(peerConnetion: PeerConnection): Array<ControllerBase>;
}
