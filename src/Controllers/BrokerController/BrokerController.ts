import { Connection } from '../../Connection/Connection';
import { ControllerBase } from '../../Controller/ControllerBase';
import { CanInvoke } from '../../Decorators/CanInvoke';
import { ControllerProperties } from '../../Decorators/ControllerProperties';
import { StringUtils } from '../../Utils/StringUtils';
import { PeerConnection } from './Models/PeerConnection';
import { Signal } from './Models/Signal';

/**
 * BrokerController class for managing peer connections and signals.
 */
@ControllerProperties("contextBroker", 7500)
export class BrokerController extends ControllerBase {
    /**
     * An array of peer connections.
     */
    public Connections: Array<PeerConnection>;

    /**
     * The current peer connection.
     */
    public Peer: PeerConnection;

    /**
     * The local peer ID.
     */
    public localPeerId: string = "";

    /**
     * Creates an instance of BrokerController.
     * @param {Connection} connection The connection instance.
     */
    constructor(connection: Connection) {
        super(connection);
        this.Connections = [];
        this.Peer = new PeerConnection(StringUtils.newGuid(), connection.id);
    }

    [key: string]: any;

    /**
     * Called when the connection is opened.
     */
    onopen() {
        this.invoke(this.Peer, "contextCreated", this.alias);
    }

    /**
     * Sends an instant message to peers.
     * @param {any} data The message data.
     */
    @CanInvoke(true)
    instantMessage(data: any) {
        const expression = (pre: BrokerController) => {
            return pre.Peer!.context >= this.Peer!.context;
        };
        this.invokeTo<BrokerController>(expression, data, "instantMessage", this.alias);
    }

    /**
     * Changes the context of the current peer.
     * @param {PeerConnection} change The new peer connection context.
     */
    @CanInvoke(true)
    changeContext(change: PeerConnection) {
        this.Peer!.context = change.context;
        this.invoke(this.Peer, "contextChanged", this.alias);
    }

    /**
     * Sends a signal to a specific peer.
     * @param {Signal} signal The signal data.
     */
    @CanInvoke(true)
    contextSignal(signal: Signal) {
        const expression = (pre: BrokerController) => {
            return pre.connection.id === signal.recipient;
        };
        this.invokeTo(expression, signal, "contextSignal", this.alias);
    }

    /**
     * Connects to peers in the same context.
     */
    @CanInvoke(true)
    connectContext() {
        const connections = this.getPeerConnections(this.Peer!)
            .map((p: BrokerController) => {
                return p.Peer;
            });

        this.invoke(connections, "connectTo", this.alias);
    }

    /**
     * Gets peer connections in the same context.
     * @param {PeerConnection} peerConnection The current peer connection.
     * @returns {Array<BrokerController>} An array of matching peer controllers.
     */
    getPeerConnections(peerConnection: PeerConnection): Array<BrokerController> {
        const match = this.findOn<BrokerController>(this.alias, (pre: BrokerController) => {
            return (pre.Peer!.context === this.Peer!.context && pre.Peer!.peerId !== peerConnection.peerId);
        }) as Array<BrokerController>;
        return match ? match : new Array<BrokerController>();
    }
}
