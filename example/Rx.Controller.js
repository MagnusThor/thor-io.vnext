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
var thor_io_1 = require('../src/thor-io');
var Proxy = require('harmony-proxy');
var PersonModel = (function () {
    function PersonModel(firstName, lastName, age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }
    return PersonModel;
}());
exports.PersonModel = PersonModel;
var RxController = (function (_super) {
    __extends(RxController, _super);
    function RxController(connection) {
        _super.call(this, connection);
        this.Person = new PersonModel("John", "Doe", 10);
        var p = new Proxy(this.Person, this.handler);
    }
    RxController.prototype.SetAge = function (age) {
        this.Person.age = age;
    };
    ;
    __decorate([
        thor_io_1.CanInvoke(true), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Number]), 
        __metadata('design:returntype', void 0)
    ], RxController.prototype, "SetAge", null);
    RxController = __decorate([
        thor_io_1.ControllerProperties("rx", false, 5000), 
        __metadata('design:paramtypes', [thor_io_1.ThorIO.Connection])
    ], RxController);
    return RxController;
}(thor_io_1.ThorIO.Controller));
exports.RxController = RxController;
//# sourceMappingURL=Rx.Controller.js.map