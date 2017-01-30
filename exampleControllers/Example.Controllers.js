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
var ChatMessageModel = (function () {
    function ChatMessageModel(age, message) {
        this.age = age;
        this.message = message;
    }
    return ChatMessageModel;
}());
var MicroServiceController = (function (_super) {
    __extends(MicroServiceController, _super);
    function MicroServiceController(connection) {
        _super.call(this, connection);
        this.minLevel = 0;
        this.maxLevel = 10;
    }
    MicroServiceController.prototype.setThreshold = function (data) {
        this.minLevel = data.min;
        this.maxLevel = data.max;
        this.invoke({ min: this.minLevel, max: this.maxLevel }, "thresholdChange");
    };
    MicroServiceController.prototype.temperatureUpdate = function (data) {
        var expression = function (pre) {
            return data.temp > pre.minLevel && data.temp < pre.maxLevel;
        };
        this.invokeTo(expression, data, "temperatureChange");
    };
    __decorate([
        thor_io_1.CanSet(false), 
        __metadata('design:type', Number)
    ], MicroServiceController.prototype, "minLevel", void 0);
    __decorate([
        thor_io_1.CanSet(false), 
        __metadata('design:type', Number)
    ], MicroServiceController.prototype, "maxLevel", void 0);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], MicroServiceController.prototype, "setThreshold", null);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], MicroServiceController.prototype, "temperatureUpdate", null);
    MicroServiceController = __decorate([
        thor_io_1.ControllerProperties("microservice", false), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], MicroServiceController);
    return MicroServiceController;
}(thor_io_1.ThorIO.Controller));
exports.MicroServiceController = MicroServiceController;
var FooController = (function (_super) {
    __extends(FooController, _super);
    function FooController(connection) {
        _super.call(this, connection);
    }
    FooController.prototype.fooMessage = function (data) {
        this.invokeToAll(data, "fooMessage", this.alias);
    };
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], FooController.prototype, "fooMessage", null);
    FooController = __decorate([
        thor_io_1.ControllerProperties("fooController", false), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], FooController);
    return FooController;
}(thor_io_1.ThorIO.Controller));
exports.FooController = FooController;
var ChatController = (function (_super) {
    __extends(ChatController, _super);
    function ChatController(connection) {
        _super.call(this, connection);
        this.age = 1;
        //   this.alias = "chat";
    }
    ChatController.prototype.sendChatMessage = function (data, topic, controller) {
        var _this = this;
        var expression = function (pre) {
            return pre.age >= _this.age;
        };
        this.invokeTo(expression, data, "chatMessage", this.alias);
    };
    ChatController.prototype.fileShare = function (fileInfo, topic, controlle, blob) {
        this.invokeToAll(fileInfo, "fileShare", this.alias, blob);
    };
    ChatController.prototype.getFoo = function () {
        this.publish(new Date(), "foo", this.alias);
    };
    __decorate([
        thor_io_1.CanSet(true), 
        __metadata('design:type', Number)
    ], ChatController.prototype, "age", void 0);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [ChatMessageModel, String, String]), 
        __metadata('design:returntype', void 0)
    ], ChatController.prototype, "sendChatMessage", null);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, Object, Object, Object]), 
        __metadata('design:returntype', void 0)
    ], ChatController.prototype, "fileShare", null);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ChatController.prototype, "getFoo", null);
    ChatController = __decorate([
        thor_io_1.ControllerProperties("chat", false), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], ChatController);
    return ChatController;
}(thor_io_1.ThorIO.Controller));
exports.ChatController = ChatController;
//# sourceMappingURL=Example.Controllers.js.map