"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require('./thor-io');
var ThorIO;
(function (ThorIO) {
    var Controllers;
    (function (Controllers) {
        var DefaultController = (function (_super) {
            __extends(DefaultController, _super);
            function DefaultController(connection) {
                _super.call(this, connection);
            }
            return DefaultController;
        }(ThorIO.Controller));
        Controllers.DefaultController = DefaultController;
    })(Controllers = ThorIO.Controllers || (ThorIO.Controllers = {}));
})(ThorIO || (ThorIO = {}));
//# sourceMappingURL=thor-io.controllers.js.map