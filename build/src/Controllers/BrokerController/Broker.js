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
 *
 *
 * @export
 * @class BrokerController
 * @extends {ControllerBase}
 */
let BrokerController = class BrokerController extends ControllerBase_1.ControllerBase {
    /**
     * Creates an instance of BrokerController.
     *
     * @param {Connection} connection
     *
     * @memberOf BrokerController
     */
    constructor(connection) {
        super(connection);
        /**
         *
         *
         * @type {string}
         * @memberOf BrokerController
         */
        this.localPeerId = "";
        this.Connections = [];
        this.Peer = new PeerConnection_1.PeerConnection(StringUtils_1.StringUtils.newGuid(), connection.id);
    }
    /**
     *
     *
     *
     * @memberOf BrokerController
     */
    onopen() {
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
    instantMessage(data, topic, controller) {
        /**
         *
         *
         * @param {ControllerBase} pre
         * @returns
         */
        var expression = (pre) => {
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
    changeContext(change) {
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
    contextSignal(signal) {
        /**
         *
         *
         * @param {BrokerController} pre
         * @returns
         */
        let expression = (pre) => {
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
    connectContext() {
        let connections = this.getPeerConnections(this.Peer)
            .map((p) => {
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
    getPeerConnections(peerConnetion) {
        let match = this.findOn(this.alias, (pre) => {
            return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId;
        });
        return match ? match : new Array;
    }
};
__decorate([
    CanInvoke_1.CanInvoke(true)
], BrokerController.prototype, "instantMessage", null);
__decorate([
    CanInvoke_1.CanInvoke(true)
], BrokerController.prototype, "changeContext", null);
__decorate([
    CanInvoke_1.CanInvoke(true)
], BrokerController.prototype, "contextSignal", null);
__decorate([
    CanInvoke_1.CanInvoke(true)
], BrokerController.prototype, "connectContext", null);
BrokerController = __decorate([
    ControllerProperties_1.ControllerProperties("contextBroker", false, 7500)
], BrokerController);
exports.BrokerController = BrokerController;
