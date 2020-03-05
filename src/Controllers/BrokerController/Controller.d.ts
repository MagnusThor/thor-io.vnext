import { ControllerBase } from '../../Controller/ControllerBase';
import { Connection } from '../../Connection';
import { PeerConnection } from './Models/PeerConnection';
import { Signal } from './Models/Signal';
export declare class BrokerController extends ControllerBase {
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
