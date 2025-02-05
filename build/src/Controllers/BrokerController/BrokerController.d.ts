import { Connection } from '../../Connection/Connection';
import { ControllerBase } from '../../Controller/ControllerBase';
import { PeerConnection } from './Models/PeerConnection';
import { Signal } from './Models/Signal';
/**
 * BrokerController class for managing peer connections and signals.
 */
export declare class BrokerController extends ControllerBase {
    /**
     * An array of peer connections.
     */
    Connections: Array<PeerConnection>;
    /**
     * The current peer connection.
     */
    Peer: PeerConnection;
    /**
     * The local peer ID.
     */
    localPeerId: string;
    /**
     * Creates an instance of BrokerController.
     * @param {Connection} connection The connection instance.
     */
    constructor(connection: Connection);
    [key: string]: any;
    /**
     * Called when the connection is opened.
     */
    onopen(): void;
    transcribe(data: {
        phrase: string;
        sourceLanguage: string;
    }): void;
    private generateSubtitles;
    /**
     * Sends an instant message to peers.
     * @param {any} data The message data.
     */
    instantMessage(data: any): void;
    /**
     * Changes the context of the current peer.
     * @param {PeerConnection} change The new peer connection context.
     */
    changeContext(change: PeerConnection): void;
    /**
     * Sends a signal to a specific peer.
     * @param {Signal} signal The signal data.
     */
    contextSignal(signal: Signal): void;
    /**
     * Connects to peers in the same context.
     */
    connectContext(): void;
    /**
     * Gets peer connections in the same context.
     * @param {PeerConnection} peerConnection The current peer connection.
     * @returns {Array<BrokerController>} An array of matching peer controllers.
     */
    getPeerConnections(peerConnection: PeerConnection): Array<BrokerController>;
}
