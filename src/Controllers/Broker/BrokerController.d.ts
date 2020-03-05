import { PeerConnection } from './PeerConnection';
import { Signal } from './Signal';
import { ControllerBase } from '../../Controller/ControllerBase';
import { Connection } from '../../Connection';
export declare class BrokerController extends ControllerBase {
    Connections: Array<PeerConnection>;
    Peer: PeerConnection;
    localPeerId: string;
    constructor(connection: Connection);
    onopen(): void;
    instantMessage(data: any, topic: string, controller: string): void;
    changeContext(change: PeerConnection): void;
    contextSignal(signal: Signal): void;
    connectContext(): void;
    getPeerConnections(peerConnetion: PeerConnection): Array<ControllerBase>;
}
