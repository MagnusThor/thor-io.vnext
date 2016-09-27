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
// This controller is seald, and cannot be connected to. A seald controller 
// is created upon start of the ThorIO.Engine. Common use case would be some thing
// that produces data, and passed it to other controllers 
var SealdController = (function (_super) {
    __extends(SealdController, _super);
    function SealdController(client) {
        var _this = this;
        _super.call(this, client);
        setInterval(function () {
            // send a chatMessage event 15 seconds..
            var message = new ChatMessage(1, new Date().toString());
            _this.invokeToAll(message, "chatMessage", "chat");
        }, 15000);
    }
    ;
    SealdController = __decorate([
        thor_io_1.ControllerProperties("chatMessageProducer", true), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], SealdController);
    return SealdController;
}(thor_io_1.ThorIO.Controller));
exports.SealdController = SealdController;
var ChatController = (function (_super) {
    __extends(ChatController, _super);
    function ChatController(client) {
        _super.call(this, client);
        this.age = 1;
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
    ChatController = __decorate([
        thor_io_1.ControllerProperties("chat", false, 2000), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], ChatController);
    return ChatController;
}(thor_io_1.ThorIO.Controller));
exports.ChatController = ChatController;
//# sourceMappingURL=Chat.Controller.js.map