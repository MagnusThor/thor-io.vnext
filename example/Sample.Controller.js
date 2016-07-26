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
// create a module for fale storage
var Fake;
(function (Fake) {
    var Storage = (function () {
        function Storage() {
        }
        Storage.Messages = []; //persist any kind of messages.
        return Storage;
    }());
    Fake.Storage = Storage;
})(Fake || (Fake = {}));
var DataSync = (function (_super) {
    __extends(DataSync, _super);
    function DataSync(client) {
        _super.call(this, client);
    }
    DataSync = __decorate([
        thor_io_1.ControllerProperties("datasync", false), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], DataSync);
    return DataSync;
}(thor_io_1.ThorIO.Controller));
exports.DataSync = DataSync;
var ExampleController = (function (_super) {
    __extends(ExampleController, _super);
    function ExampleController(client) {
        _super.call(this, client);
        this.room = "foo"; // this is used the the expression in the invokeTo call in send Message
        // properties such as "room" can be modified by calling i.e .SetProperty("room","bar") in the 
        // client.
        this.alias = "example";
    }
    ExampleController.prototype.sendMessage = function (data, controller, topic) {
        // add the message inbound to the fake 
        Fake.Storage.Messages.push(data);
        this.invoke(data, "chatMessage-one", this.alias);
        this.invokeToAll(data, "chatMessage-all", this.alias);
        this.invokeTo(function (pre) { return pre.room === "foo"; }, data, "chatMessage-to", this.alias);
        this.publishToAll(data, "mySub", this.alias);
    };
    ExampleController.prototype.onopen = function () {
        // send the "history" preserved in the fake storage
        this.invoke(Fake.Storage.Messages, "history", this.alias);
    };
    ExampleController.prototype.onclose = function () {
    };
    return ExampleController;
}(thor_io_1.ThorIO.Controller));
exports.ExampleController = ExampleController;
//# sourceMappingURL=Sample.Controller.js.map