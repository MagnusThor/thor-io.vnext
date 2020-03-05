"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const CanInvoke_1 = require("../../Decorators/CanInvoke");
const ControllerBase_1 = require("../../Controller/ControllerBase");
const Connection_1 = require("../../Connection");
const ControllerProperties_1 = require("../../Decorators/ControllerProperties");
const PeerConnection_1 = require("./Models/PeerConnection");
const Signal_1 = require("./Models/Signal");
let BrokerController = class BrokerController extends ControllerBase_1.ControllerBase {
    constructor(connection) {
        super(connection);
        this.Connections = [];
    }
    onopen() {
        this.Peer = new PeerConnection_1.PeerConnection(ControllerBase_1.ControllerBase.newGuid(), this.connection.id);
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
        let connections = this.getPeerConnections(this.Peer).map((p) => {
            return p.Peer;
        });
        this.invoke(connections, "connectTo", this.alias);
    }
    getPeerConnections(peerConnetion) {
        let match = this.findOn(this.alias, (pre) => {
            return pre.Peer.context === this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId;
        });
        return match;
    }
};
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BrokerController.prototype, "instantMessage", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PeerConnection_1.PeerConnection]),
    __metadata("design:returntype", void 0)
], BrokerController.prototype, "changeContext", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Signal_1.Signal]),
    __metadata("design:returntype", void 0)
], BrokerController.prototype, "contextSignal", null);
__decorate([
    CanInvoke_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BrokerController.prototype, "connectContext", null);
BrokerController = __decorate([
    ControllerProperties_1.ControllerProperties("contextBroker", false, 7500),
    __metadata("design:paramtypes", [Connection_1.Connection])
], BrokerController);
exports.BrokerController = BrokerController;
