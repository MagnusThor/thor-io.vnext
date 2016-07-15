"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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