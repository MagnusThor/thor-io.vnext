"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var thor_io_1 = require("../src/thor-io");
var Generic = (function (_super) {
    __extends(Generic, _super);
    function Generic(client) {
        _super.call(this, client);
        this.room = "foo";
        this.alias = "example";
    }
    Generic.prototype.sendMessage = function (data, controller, topic) {
        this.invoke(data, "chatMessage-one", this.alias);
        this.invokeToAll(data, "chatMessage-all", this.alias);
        var expression = function (pre) {
            if (pre.room === "foo")
                return pre;
        };
        this.invokeTo(expression, data, "chatMessage-to", this.alias);
        this.publishToAll(data, "mySub", this.alias);
    };
    Generic.prototype.onopen = function () {
        console.log("called on open");
    };
    Generic.prototype.onclose = function () {
        console.log("called on close");
    };
    return Generic;
}(thor_io_1.ThorIO.Controller));
exports.Generic = Generic;
//# sourceMappingURL=Sample.Controller.js.map