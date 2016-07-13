"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var thor_io_1 = require("../src/thor-io");
var PeerConnection = (function () {
    function PeerConnection() {
    }
    return PeerConnection;
}());
var Signal = (function () {
    function Signal() {
    }
    return Signal;
}());
var BrokerController = (function (_super) {
    __extends(BrokerController, _super);
    function BrokerController(client) {
        _super.call(this, client);
        this.alias = "broker";
        this.Connections = new Array();
        this.Peer = new PeerConnection();
    }
    BrokerController.prototype.createId = function () {
        return Math.random().toString(36).substring(2);
    };
    ;
    BrokerController.prototype.onopen = function () {
        this.Peer.context = this.createId();
        this.Peer.peerId = this.client.id;
        this.invoke(this.Peer, "contextCreated", this.alias);
    };
    BrokerController.prototype.changeContext = function (change) {
        this.Peer.context = change.context;
        this.invoke(this.Peer, "contextChanged", this.alias);
    };
    BrokerController.prototype.contextSignal = function (signal) {
        var expression = function (pre) {
            if (pre.client.id === signal.recipient)
                return pre;
        };
        this.invokeTo(expression, signal, "contextSignal", this.alias);
    };
    BrokerController.prototype.connectContext = function () {
        var connections = this.getPeerConnections(this.Peer).map(function (p) { return p.Peer; });
        this.invoke(connections, "connectTo", this.alias);
    };
    BrokerController.prototype.getPeerConnections = function (peerConnetion) {
        var _this = this;
        var connections = this.getConnections().map(function (connection) {
            if (connection.hasController(_this.alias))
                return connection.getController(_this.alias);
        }).filter(function (pre) {
            return pre.Peer.context === _this.Peer.context && pre.Peer.peerId !== peerConnetion.peerId;
        });
        return connections;
    };
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [PeerConnection]), 
        __metadata('design:returntype', void 0)
    ], BrokerController.prototype, "changeContext", null);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Signal]), 
        __metadata('design:returntype', void 0)
    ], BrokerController.prototype, "contextSignal", null);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], BrokerController.prototype, "connectContext", null);
    BrokerController = __decorate([
        thor_io_1.ControllerProperties("broker"), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], BrokerController);
    return BrokerController;
}(thor_io_1.ThorIO.Controller));
exports.BrokerController = BrokerController;
//# sourceMappingURL=Broker.Controller.js.map