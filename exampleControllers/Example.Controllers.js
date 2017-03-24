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
const thor_io_1 = require("../src/thor-io");
class ChatMessageModel {
    constructor(age, message) {
        this.age = age;
        this.message = message;
    }
}
let MicroServiceController = class MicroServiceController extends thor_io_1.ThorIO.Controller {
    constructor(connection) {
        super(connection);
        this.minLevel = 0;
        this.maxLevel = 10;
    }
    setThreshold(data) {
        this.minLevel = data.min;
        this.maxLevel = data.max;
        this.invoke({ min: this.minLevel, max: this.maxLevel }, "thresholdChange");
    }
    temperatureUpdate(data) {
        let expression = (pre) => {
            return data.temp > pre.minLevel && data.temp < pre.maxLevel;
        };
        this.invokeTo(expression, data, "temperatureChange");
    }
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
exports.MicroServiceController = MicroServiceController;
let FooController = class FooController extends thor_io_1.ThorIO.Controller {
    constructor(connection) {
        super(connection);
    }
    fooMessage(data) {
        this.invokeToAll(data, "fooMessage", this.alias);
    }
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
exports.FooController = FooController;
let ChatController = class ChatController extends thor_io_1.ThorIO.Controller {
    constructor(connection) {
        super(connection);
        this.age = 1;
        //   this.alias = "chat";
    }
    sendChatMessage(data, topic, controller) {
        var expression = (pre) => {
            return pre.age >= this.age;
        };
        this.invokeTo(expression, data, "chatMessage", this.alias);
    }
    fileShare(fileInfo, topic, controlle, blob) {
        this.invokeToAll(fileInfo, "fileShare", this.alias, blob);
    }
    getFoo() {
        this.publish(new Date(), "foo", this.alias);
    }
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
exports.ChatController = ChatController;
//# sourceMappingURL=Example.Controllers.js.map