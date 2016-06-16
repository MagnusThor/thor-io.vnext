"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var thor_io_1 = require("../src/thor-io");
var ChatMessage = (function () {
    function ChatMessage() {
    }
    return ChatMessage;
}());
var ChatController = (function (_super) {
    __extends(ChatController, _super);
    function ChatController(client) {
        _super.call(this, client);
        this.alias = "chat";
        this.age = 1;
    }
    ChatController.prototype.sendChatMessage = function (data, topic, controller) {
        var _this = this;
        var expression = function (pre) {
            if (pre.age >= _this.age)
                return pre;
        };
        this.invokeTo(expression, data, "chatMessage", this.alias);
    };
    return ChatController;
}(thor_io_1.ThorIO.Controller));
exports.ChatController = ChatController;
//# sourceMappingURL=Chat.Controller.js.map