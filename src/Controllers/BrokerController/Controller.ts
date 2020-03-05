import { CanInvoke } from '../../Decorators/CanInvoke';


import { ControllerBase } from '../../Controller/ControllerBase';
import { Connection } from '../../Connection';
import { ControllerProperties } from '../../Decorators/ControllerProperties';
import { PeerConnection } from './Models/PeerConnection';
import { Signal } from './Models/Signal';
/**
 *
 *
 * @export
 * @class BrokerController
 * @extends {ControllerBase}
 */
@ControllerProperties("contextBroker", false, 7500)
export class BrokerController extends ControllerBase {
    /**
     *
     *
     * @type {Array<PeerConnection>}
     * @memberOf BrokerController
     */
    public Connections: Array<PeerConnection>;
    /**
     *
     *
     * @type {PeerConnection}
     * @memberOf BrokerController
     */
    public Peer: PeerConnection;
    /**
     *
     *
     * @type {string}
     * @memberOf BrokerController
     */
    public localPeerId: string;Signal
    /**
     * Creates an instance of BrokerController.
     *
     * @param {Connection} connection
     *
     * @memberOf BrokerController
     */
    constructor(connection: Connection) {
        super(connection);
        this.Connections = [];
    }
    /**
     *
     *
     *
     * @memberOf BrokerController
     */
    onopen() {
        this.Peer = new PeerConnection(ControllerBase.newGuid(), this.connection.id);
        this.invoke(this.Peer, "contextCreated", this.alias);
    }
    /**
     *
     *
     * @param {*} data
     * @param {string} topic
     * @param {string} controller
     *
     * @memberOf BrokerController
     */
    @CanInvoke(true)
    instantMessage(data: any, topic: string, controller: string) {
        /**
         *
         *
         * @param {BrokerController} pre
         * @returns
         */
        var expression = (pre: BrokerController) => {
            return pre.Peer.context >= this.Peer.context;
        };
        this.invokeTo(expression, data, "instantMessage", this.alias);
    }
    /**
     *
     *
     * @param {PeerConnection} change
     *
     * @memberOf BrokerCControllerPropertiesontroller
     */
    @CanInvoke(true)
    changeContext(change: PeerConnection) {
        this.Peer.context = change.context;
        this.invoke(this.Peer, "contextChanged", this.alias);
    }
    /**
     *
     *
     * @param {Signal} signal
     *
     * @memberOf BrokerController
     */
    @CanInvoke(true)
    contextSignal(signal: Signal) {
        /**
         *
         *
         * @param {BrokerController} pre
         * @returns
         */
        let expression = (pre: BrokerController) => {
            return pre.connection.id === signal.recipient;
        };
        this.invokeTo(expression, signal, "contextSignal", this.alias);
    }
    /**
     *
     *
     *
     * @memberOf BrokerController
     */
    @CanInvoke(true)
    connectContext() {
        /**
         *
         *
         * @param {BrokerController} p
         * @returns
         */
        let connections = this.getPeerConnections(this.Peer).map((p: BrokerController) => {
            return p.Peer;
        });
        this.invoke(connections, "connectTo", this.alias);
    }
    /**
     *
     *
     * @param {PeerConnection} peerConnetion
     * @returns {Array<BrokerController>}
     *
     * @memberOf BrokerController
     */
    getPeerConnections(peerConnetion: PeerConnection): Array<ControllerBase> {
        /**
         *
         *
         * @param {BrokerController} pre
         * @returns
         */
        let match = this.findOn(this.alias, (pre: BrokerController) => {
            return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId;
        });
        return match;
    }
}
