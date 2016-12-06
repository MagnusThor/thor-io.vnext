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
var ChatMessage = (function () {
    function ChatMessage(age, message) {
        this.age = age;
        this.message = message;
    }
    return ChatMessage;
}());
var FooController = (function (_super) {
    __extends(FooController, _super);
    function FooController(connection) {
        _super.call(this, connection);
    }
    FooController.prototype.onopen = function () {
        //   this.invoke({src:'open'},"fooMessage");
    };
    FooController.prototype.onclose = function () {
    };
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
        thor_io_1.ControllerProperties("fooController"), 
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
        this.alias = "chat";
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
    ChatController.prototype.regExpMethod = function (size, age) {
        //   console.log(arguments);
    };
    __decorate([
        thor_io_1.CanSet(true), 
        __metadata('design:type', Number)
    ], ChatController.prototype, "age", void 0);
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [ChatMessage, String, String]), 
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
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Number, Number]), 
        __metadata('design:returntype', void 0)
    ], ChatController.prototype, "regExpMethod", null);
    ChatController = __decorate([
        thor_io_1.ControllerProperties("chat"), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], ChatController);
    return ChatController;
}(thor_io_1.ThorIO.Controller));
exports.ChatController = ChatController;
//# sourceMappingURL=Chat.Controller.js.map