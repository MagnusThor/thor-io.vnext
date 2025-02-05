"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BrokerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerController = void 0;
const ControllerBase_1 = require("../../Controller/ControllerBase");
const CanInvoke_1 = require("../../Decorators/CanInvoke");
const ControllerProperties_1 = require("../../Decorators/ControllerProperties");
const StringUtils_1 = require("../../Utils/StringUtils");
const PeerConnection_1 = require("./Models/PeerConnection");
let BrokerController = BrokerController_1 = class BrokerController extends ControllerBase_1.ControllerBase {
    constructor(connection) {
        super(connection);
        this.localPeerId = "";
        this.Connections = [];
        this.Peer = new PeerConnection_1.PeerConnection(StringUtils_1.StringUtils.newGuid(), connection.id);
    }
    onopen() {
        this.invoke(this.Peer, "contextCreated", this.alias);
    }
    instantMessage(data, topic, controller) {
        var expression = (pre) => {
            return pre.Peer.context >= this.Peer.context;
        };
        this.invokeTo(expression, data, "instantMessage", this.alias);
    }
    changeContext(change) {
        this.Peer.context = change.context;
        this.invoke(this.Peer, "contextChanged", this.alias);
    }
    contextSignal(signal) {
        let expression = (pre) => {
            return pre.connection.id === signal.recipient;
        };
        this.invokeTo(expression, signal, "contextSignal", this.alias);
    }
    connectContext() {
        let connections = this.getPeerConnections(this.Peer)
            .map((p) => {
            return p.Peer;
        });
        this.invoke(connections, "connectTo", this.alias);
    }
    getPeerConnections(peerConnetion) {
        let match = this.findOn(this.alias, (pre) => {
            return (pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId);
        });
        return match ? match : new Array();
    }
    new(connection) {
        return new BrokerController_1(connection);
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
BrokerController = BrokerController_1 = __decorate([
    ControllerProperties_1.ControllerProperties("contextBroker", 7500)
], BrokerController);
exports.BrokerController = BrokerController;
