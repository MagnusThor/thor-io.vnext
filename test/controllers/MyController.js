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
var _a;
const index_1 = require("../../index");
let MyController = class MyController extends index_1.ThorIO.Controller {
    constructor(connection) {
        super(connection);
        this.size = 0;
    }
    invokeAndReturn(data) {
        this.invoke(data, "invokeAndReturn");
    }
    invokeAndSendToAll(data) {
        this.invokeToAll(data, "invokeAndSendToAll");
    }
    publishTemperature(temperatue) {
        this.publishToAll(temperatue, "tempChange");
    }
    invokeAndSendOthers(data) {
        this.invokeToOthers(data, "invokeAndSendOthers");
    }
    invokeToExpr(data) {
        let expr = function (pre) {
            return pre.size >= 10;
        };
        this.invokeTo(expr, data, "invokeToExpr");
    }
};
__decorate([
    index_1.CanSet(true),
    __metadata("design:type", Number)
], MyController.prototype, "size", void 0);
__decorate([
    index_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MyController.prototype, "invokeAndReturn", null);
__decorate([
    index_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MyController.prototype, "invokeAndSendToAll", null);
__decorate([
    index_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MyController.prototype, "publishTemperature", null);
__decorate([
    index_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MyController.prototype, "invokeAndSendOthers", null);
__decorate([
    index_1.CanInvoke(true),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MyController.prototype, "invokeToExpr", null);
MyController = __decorate([
    index_1.ControllerProperties("mycontroller"),
    __metadata("design:paramtypes", [typeof (_a = typeof index_1.ThorIO !== "undefined" && index_1.ThorIO.Connection) === "function" ? _a : Object])
], MyController);
exports.MyController = MyController;
