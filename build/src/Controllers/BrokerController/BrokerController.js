"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerController = void 0;
const ControllerBase_1 = require("../../Controller/ControllerBase");
const CanInvoke_1 = require("../../Decorators/CanInvoke");
const ControllerProperties_1 = require("../../Decorators/ControllerProperties");
const StringUtils_1 = require("../../Utils/StringUtils");
const PeerConnection_1 = require("./Models/PeerConnection");
/**
 * BrokerController class for managing peer connections and signals.
 */
let BrokerController = class BrokerController extends ControllerBase_1.ControllerBase {
    /**
     * Creates an instance of BrokerController.
     * @param {Connection} connection The connection instance.
     */
    constructor(connection) {
        super(connection);
        /**
         * The local peer ID.
         */
        this.localPeerId = "";
        this.Connections = [];
        this.Peer = new PeerConnection_1.PeerConnection(StringUtils_1.StringUtils.newGuid(), connection.id);
    }
    /**
     * Called when the connection is opened.
     */
    onopen() {
        this.invoke(this.Peer, "contextCreated", this.alias);
    }
    transcribe(data) {
        if (!this.generateSubtitles()) {
            return;
        }
        console.log(`Transcribing ${data.phrase} from ${data.sourceLanguage} to ${this.Peer.language}`);
    }
    generateSubtitles() {
        return this.Peer.language != undefined;
    }
    /**
     * Sends an instant message to peers.
     * @param {any} data The message data.
     */
    instantMessage(data) {
        const expression = (pre) => {
            return pre.Peer.context >= this.Peer.context;
        };
        this.invokeTo(expression, data, "instantMessage", this.alias);
    }
    /**
     * Changes the context of the current peer.
     * @param {PeerConnection} change The new peer connection context.
     */
    changeContext(change) {
        this.Peer.context = change.context;
        this.invoke(this.Peer, "contextChanged", this.alias);
    }
    /**
     * Sends a signal to a specific peer.
     * @param {Signal} signal The signal data.
     */
    contextSignal(signal) {
        const expression = (pre) => {
            return pre.connection.id === signal.recipient;
        };
        this.invokeTo(expression, signal, "contextSignal", this.alias);
    }
    /**
     * Connects to peers in the same context.
     */
    connectContext() {
        const connections = this.getPeerConnections(this.Peer)
            .map((p) => {
            return p.Peer;
        });
        this.invoke(connections, "connectTo", this.alias);
    }
    /**
     * Gets peer connections in the same context.
     * @param {PeerConnection} peerConnection The current peer connection.
     * @returns {Array<BrokerController>} An array of matching peer controllers.
     */
    getPeerConnections(peerConnection) {
        const match = this.findOn(this.alias, (pre) => {
            return (pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnection.peerId);
        });
        return match ? match : new Array();
    }
};
exports.BrokerController = BrokerController;
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], BrokerController.prototype, "transcribe", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], BrokerController.prototype, "instantMessage", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], BrokerController.prototype, "changeContext", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], BrokerController.prototype, "contextSignal", null);
__decorate([
    (0, CanInvoke_1.CanInvoke)(true)
], BrokerController.prototype, "connectContext", null);
exports.BrokerController = BrokerController = __decorate([
    (0, ControllerProperties_1.ControllerProperties)("contextBroker", 7500)
], BrokerController);
