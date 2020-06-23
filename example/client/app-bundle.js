/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./example/client.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./example/client.js":
/*!***************************!*\
  !*** ./example/client.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst thor_io_client_vnext_1 = __webpack_require__(/*! thor-io.client-vnext */ \"./node_modules/thor-io.client-vnext/index.js\");\nclass TestClient {\n    constructor() {\n        this.factory = new thor_io_client_vnext_1.Factory(\"ws://localhost:1337\", [\"mycontroller\"], { foo: \"bar\", mokey: \"face\" });\n        this.factory.OnOpen = (controller) => {\n            this.controllers = controller;\n            console.log(controller);\n            controller.Connect();\n        };\n    }\n}\nexports.TestClient = TestClient;\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n    let testClient = new TestClient();\n    window[\"testClient\"] = testClient;\n});\n\n\n//# sourceURL=webpack:///./example/client.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/index.js":
/*!****************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar BandwidthConstraints_1 = __webpack_require__(/*! ./src/WebRTC/BandwidthConstraints */ \"./node_modules/thor-io.client-vnext/src/WebRTC/BandwidthConstraints.js\");\nexports.BandwidthConstraints = BandwidthConstraints_1.BandwidthConstraints;\nvar BinaryMessage_1 = __webpack_require__(/*! ./src/Messages/BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nexports.BinaryMessage = BinaryMessage_1.BinaryMessage;\nvar DataChannel_1 = __webpack_require__(/*! ./src/WebRTC/DataChannel */ \"./node_modules/thor-io.client-vnext/src/WebRTC/DataChannel.js\");\nexports.DataChannel = DataChannel_1.DataChannel;\nvar Factory_1 = __webpack_require__(/*! ./src/Factory */ \"./node_modules/thor-io.client-vnext/src/Factory.js\");\nexports.Factory = Factory_1.Factory;\nvar TextMessage_1 = __webpack_require__(/*! ./src/Messages/TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nexports.Message = TextMessage_1.TextMessage;\nvar Listener_1 = __webpack_require__(/*! ./src/Listener */ \"./node_modules/thor-io.client-vnext/src/Listener.js\");\nexports.Listener = Listener_1.Listener;\nvar PeerChannel_1 = __webpack_require__(/*! ./src/WebRTC/PeerChannel */ \"./node_modules/thor-io.client-vnext/src/WebRTC/PeerChannel.js\");\nexports.PeerChannel = PeerChannel_1.PeerChannel;\nvar PropertyMessage_1 = __webpack_require__(/*! ./src/Messages/PropertyMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js\");\nexports.PropertyMessage = PropertyMessage_1.PropertyMessage;\nvar Controller_1 = __webpack_require__(/*! ./src/Controller */ \"./node_modules/thor-io.client-vnext/src/Controller.js\");\nexports.Proxy = Controller_1.Controller;\nvar Utils_1 = __webpack_require__(/*! ./src/Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nexports.Utils = Utils_1.Utils;\nvar WebRTC_1 = __webpack_require__(/*! ./src/WebRTC/WebRTC */ \"./node_modules/thor-io.client-vnext/src/WebRTC/WebRTC.js\");\nexports.WebRTC = WebRTC_1.WebRTC;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/index.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Controller.js":
/*!*************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Controller.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar TextMessage_1 = __webpack_require__(/*! ./Messages/TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nvar Listener_1 = __webpack_require__(/*! ./Listener */ \"./node_modules/thor-io.client-vnext/src/Listener.js\");\nvar Controller = (function () {\n    function Controller(alias, ws) {\n        var _this = this;\n        this.alias = alias;\n        this.ws = ws;\n        this.listeners = new Array();\n        this.IsConnected = false;\n        this.On(\"___error\", function (err) {\n            _this.OnError(err);\n        });\n    }\n    Controller.prototype.OnError = function (event) { };\n    Controller.prototype.OnOpen = function (event) { };\n    Controller.prototype.OnClose = function (event) { };\n    Controller.prototype.Connect = function () {\n        this.ws.send(new TextMessage_1.TextMessage(\"___connect\", {}, this.alias).toString());\n        return this;\n    };\n    ;\n    Controller.prototype.Close = function () {\n        this.ws.send(new TextMessage_1.TextMessage(\"___close\", {}, this.alias).toString());\n        return this;\n    };\n    ;\n    Controller.prototype.Subscribe = function (topic, callback) {\n        this.ws.send(new TextMessage_1.TextMessage(\"___subscribe\", {\n            topic: topic,\n            controller: this.alias\n        }, this.alias).toString());\n        return this.On(topic, callback);\n    };\n    Controller.prototype.Unsubscribe = function (topic) {\n        this.ws.send(new TextMessage_1.TextMessage(\"___unsubscribe\", {\n            topic: topic,\n            controller: this.alias\n        }, this.alias).toString());\n    };\n    Controller.prototype.On = function (topic, fn) {\n        var listener = new Listener_1.Listener(topic, fn);\n        this.listeners.push(listener);\n        return listener;\n    };\n    Controller.prototype.Off = function (topic) {\n        var index = this.listeners.indexOf(this.findListener(topic));\n        if (index >= 0)\n            this.listeners.splice(index, 1);\n    };\n    Controller.prototype.findListener = function (topic) {\n        var listener = this.listeners.find(function (pre) {\n            return pre.topic === topic;\n        });\n        return listener;\n    };\n    Controller.prototype.InvokeBinary = function (buffer) {\n        if (buffer instanceof ArrayBuffer) {\n            this.ws.send(buffer);\n            return this;\n        }\n        else {\n            throw (\"parameter provided must be an ArrayBuffer constructed by Client.BinaryMessage\");\n        }\n    };\n    Controller.prototype.PublishBinary = function (buffer) {\n        if (buffer instanceof ArrayBuffer) {\n            this.ws.send(buffer);\n            return this;\n        }\n        else {\n            throw (\"parameter provided must be an ArrayBuffer constructed by Client.BinaryMessage\");\n        }\n    };\n    Controller.prototype.Invoke = function (method, data, controller) {\n        this.ws.send(new TextMessage_1.TextMessage(method, data, controller || this.alias).toString());\n        return this;\n    };\n    Controller.prototype.Publish = function (topic, data, controller) {\n        this.Invoke(topic, data, controller || this.alias);\n        return this;\n    };\n    Controller.prototype.SetProperty = function (propName, propValue, controller) {\n        this.Invoke(propName, propValue, controller || this.alias);\n        return this;\n    };\n    Controller.prototype.Dispatch = function (topic, data, buffer) {\n        if (topic === \"___open\") {\n            this.IsConnected = true;\n            this.OnOpen(JSON.parse(data));\n            return;\n        }\n        else if (topic === \"___close\") {\n            this.OnClose([JSON.parse(data)]);\n            this.IsConnected = false;\n        }\n        else {\n            var listener = this.findListener(topic);\n            if (listener)\n                listener.fn(JSON.parse(data), buffer);\n        }\n    };\n    return Controller;\n}());\nexports.Controller = Controller;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Controller.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Factory.js":
/*!**********************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Factory.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar BinaryMessage_1 = __webpack_require__(/*! ./Messages/BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nvar Controller_1 = __webpack_require__(/*! ./Controller */ \"./node_modules/thor-io.client-vnext/src/Controller.js\");\nvar Factory = (function () {\n    function Factory(url, controllers, params) {\n        var _this = this;\n        this.url = url;\n        this.controllers = new Map();\n        this.ws = new WebSocket(url + this.toQuery(params || {}));\n        this.ws.binaryType = \"arraybuffer\";\n        controllers.forEach(function (alias) {\n            _this.controllers.set(alias, new Controller_1.Controller(alias, _this.ws));\n        });\n        this.ws.onmessage = function (event) {\n            if (typeof (event.data) !== \"object\") {\n                var message = JSON.parse(event.data);\n                _this.GetController(message.C).Dispatch(message.T, message.D);\n            }\n            else {\n                var message = BinaryMessage_1.BinaryMessage.fromArrayBuffer(event.data);\n                _this.GetController(message.C).Dispatch(message.T, message.D, message.B);\n            }\n        };\n        this.ws.onclose = function (event) {\n            _this.IsConnected = false;\n            _this.OnClose.apply(_this, [event]);\n        };\n        this.ws.onerror = function (error) {\n            _this.OnError.apply(_this, [error]);\n        };\n        this.ws.onopen = function (event) {\n            _this.IsConnected = true;\n            _this.OnOpen.apply(_this, Array.from(_this.controllers.values()));\n        };\n    }\n    Factory.prototype.toQuery = function (obj) {\n        return \"?\" + Object.keys(obj).map(function (key) { return (encodeURIComponent(key) + \"=\" +\n            encodeURIComponent(obj[key])); }).join(\"&\");\n    };\n    Factory.prototype.Close = function () {\n        this.ws.close();\n    };\n    Factory.prototype.GetController = function (alias) {\n        return this.controllers.get(alias);\n    };\n    Factory.prototype.RemoveController = function (alias) {\n        this.controllers.delete(alias);\n    };\n    Factory.prototype.OnOpen = function (controllers) { };\n    Factory.prototype.OnError = function (error) { };\n    Factory.prototype.OnClose = function (event) { };\n    return Factory;\n}());\nexports.Factory = Factory;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Factory.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Listener.js":
/*!***********************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Listener.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar Listener = (function () {\n    function Listener(topic, fn) {\n        this.fn = fn;\n        this.topic = topic;\n        this.count = 0;\n    }\n    return Listener;\n}());\nexports.Listener = Listener;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Listener.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js":
/*!*************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar Utils_1 = __webpack_require__(/*! ../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nvar TextMessage_1 = __webpack_require__(/*! ./TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nvar BinaryMessage = (function () {\n    function BinaryMessage(message, arrayBuffer) {\n        this.arrayBuffer = arrayBuffer;\n        this.header = new Uint8Array(Utils_1.Utils.longToArray(message.length));\n        this.Buffer = this.joinBuffers(this.joinBuffers(this.header.buffer, Utils_1.Utils.stingToBuffer(message).buffer), arrayBuffer);\n    }\n    BinaryMessage.fromArrayBuffer = function (buffer) {\n        var bytes = new Uint8Array(buffer);\n        var header = bytes.slice(0, 8);\n        var payloadLength = Utils_1.Utils.arrayToLong(header);\n        var start = header.byteLength + payloadLength;\n        var bytesMessage = bytes.slice(header.byteLength, start);\n        var stop = buffer.byteLength - start;\n        var messageBuffer = bytes.slice(start, stop);\n        var message = JSON.parse(String.fromCharCode.apply(null, new Uint16Array(bytesMessage)));\n        return new TextMessage_1.TextMessage(message.T, message.D, message.C, messageBuffer);\n    };\n    BinaryMessage.prototype.joinBuffers = function (a, b) {\n        var newBuffer = new Uint8Array(a.byteLength + b.byteLength);\n        newBuffer.set(new Uint8Array(a), 0);\n        newBuffer.set(new Uint8Array(b), a.byteLength);\n        return newBuffer.buffer;\n    };\n    return BinaryMessage;\n}());\nexports.BinaryMessage = BinaryMessage;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js":
/*!***************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar Utils_1 = __webpack_require__(/*! ../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nvar PropertyMessage = (function () {\n    function PropertyMessage() {\n        this.messageId = Utils_1.Utils.newGuid();\n    }\n    return PropertyMessage;\n}());\nexports.PropertyMessage = PropertyMessage;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js":
/*!***********************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar BinaryMessage_1 = __webpack_require__(/*! ./BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nvar TextMessage = (function () {\n    function TextMessage(topic, object, controller, buffer) {\n        this.D = object;\n        this.T = topic;\n        this.C = controller;\n        this.B = buffer;\n    }\n    Object.defineProperty(TextMessage.prototype, \"JSON\", {\n        get: function () {\n            return {\n                T: this.T,\n                D: JSON.stringify(this.D),\n                C: this.C\n            };\n        },\n        enumerable: true,\n        configurable: true\n    });\n    TextMessage.prototype.toString = function () {\n        return JSON.stringify(this.JSON);\n    };\n    TextMessage.fromArrayBuffer = function (buffer) {\n        return BinaryMessage_1.BinaryMessage.fromArrayBuffer(buffer);\n    };\n    return TextMessage;\n}());\nexports.TextMessage = TextMessage;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Utils/Utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Utils/Utils.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar Utils = (function () {\n    function Utils() {\n    }\n    Utils.stingToBuffer = function (str) {\n        var len = str.length;\n        var arr = new Array(len);\n        for (var i = 0; i < len; i++) {\n            arr[i] = str.charCodeAt(i) & 0xFF;\n        }\n        return new Uint8Array(arr);\n    };\n    Utils.arrayToLong = function (byteArray) {\n        var value = 0;\n        var byteLength = byteArray.byteLength;\n        for (var i = byteLength - 1; i >= 0; i--) {\n            value = (value * 256) + byteArray[i];\n        }\n        return value;\n    };\n    Utils.longToArray = function (long) {\n        var byteArray = new Uint8Array(8);\n        var byteLength = byteArray.length;\n        for (var index = 0; index < byteLength; index++) {\n            var byte = long & 0xff;\n            byteArray[index] = byte;\n            long = (long - byte) / 256;\n        }\n        return byteArray;\n    };\n    Utils.newGuid = function () {\n        var s4 = function () {\n            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);\n        };\n        return s4() + s4() + \"-\" + s4() + \"-\" + s4() + \"-\" + s4() + \"-\" + s4() + s4() + s4();\n    };\n    return Utils;\n}());\nexports.Utils = Utils;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Utils/Utils.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/WebRTC/BandwidthConstraints.js":
/*!******************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/WebRTC/BandwidthConstraints.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar BandwidthConstraints = (function () {\n    function BandwidthConstraints(videobandwidth, audiobandwidth) {\n        this.videobandwidth = videobandwidth;\n        this.audiobandwidth = audiobandwidth;\n    }\n    return BandwidthConstraints;\n}());\nexports.BandwidthConstraints = BandwidthConstraints;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/WebRTC/BandwidthConstraints.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/WebRTC/DataChannel.js":
/*!*********************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/WebRTC/DataChannel.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar TextMessage_1 = __webpack_require__(/*! ../Messages/TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nvar Listener_1 = __webpack_require__(/*! ../Listener */ \"./node_modules/thor-io.client-vnext/src/Listener.js\");\nvar DataChannel = (function () {\n    function DataChannel(name, listeners) {\n        this.listeners = listeners || new Array();\n        this.PeerChannels = new Array();\n        this.Name = name;\n    }\n    DataChannel.prototype.findListener = function (topic) {\n        var listener = this.listeners.find(function (pre) {\n            return pre.topic === topic;\n        });\n        return listener;\n    };\n    DataChannel.prototype.On = function (topic, fn) {\n        var listener = new Listener_1.Listener(topic, fn);\n        this.listeners.push(listener);\n        return listener;\n    };\n    DataChannel.prototype.Off = function (topic) {\n        var index = this.listeners.indexOf(this.findListener(topic));\n        if (index >= 0)\n            this.listeners.splice(index, 1);\n    };\n    DataChannel.prototype.OnOpen = function (event, peerId) { };\n    DataChannel.prototype.OnClose = function (event, peerId) { };\n    DataChannel.prototype.onMessage = function (event) {\n        var msg = JSON.parse(event.data);\n        var listener = this.findListener(msg.T);\n        if (listener)\n            listener.fn.apply(this, [JSON.parse(msg.D)]);\n    };\n    DataChannel.prototype.Close = function () {\n        this.PeerChannels.forEach(function (pc) {\n            pc.dataChannel.close();\n        });\n    };\n    DataChannel.prototype.Invoke = function (topic, data, controller) {\n        var _this = this;\n        this.PeerChannels.forEach(function (channel) {\n            if (channel.dataChannel.readyState === \"open\") {\n                channel.dataChannel.send(new TextMessage_1.TextMessage(topic, data, _this.Name).toString());\n            }\n        });\n        return this;\n    };\n    DataChannel.prototype.addPeerChannel = function (pc) {\n        this.PeerChannels.push(pc);\n    };\n    DataChannel.prototype.removePeerChannel = function (id) {\n        var match = this.PeerChannels.find(function (p) {\n            return p.peerId === id;\n        });\n        var index = this.PeerChannels.indexOf(match);\n        if (index > -1)\n            this.PeerChannels.splice(index, 1);\n    };\n    return DataChannel;\n}());\nexports.DataChannel = DataChannel;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/WebRTC/DataChannel.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/WebRTC/PeerChannel.js":
/*!*********************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/WebRTC/PeerChannel.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar PeerChannel = (function () {\n    function PeerChannel(peerId, dataChannel, label) {\n        this.peerId = peerId;\n        this.dataChannel = dataChannel;\n        this.label = label;\n    }\n    return PeerChannel;\n}());\nexports.PeerChannel = PeerChannel;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/WebRTC/PeerChannel.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/WebRTC/WebRTC.js":
/*!****************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/WebRTC/WebRTC.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar WebRTCConnection_1 = __webpack_require__(/*! ./WebRTCConnection */ \"./node_modules/thor-io.client-vnext/src/WebRTC/WebRTCConnection.js\");\nvar PeerChannel_1 = __webpack_require__(/*! ./PeerChannel */ \"./node_modules/thor-io.client-vnext/src/WebRTC/PeerChannel.js\");\nvar DataChannel_1 = __webpack_require__(/*! ./DataChannel */ \"./node_modules/thor-io.client-vnext/src/WebRTC/DataChannel.js\");\nvar BandwidthConstraints_1 = __webpack_require__(/*! ./BandwidthConstraints */ \"./node_modules/thor-io.client-vnext/src/WebRTC/BandwidthConstraints.js\");\nvar WebRTC = (function () {\n    function WebRTC(brokerController, rtcConfig) {\n        var _this = this;\n        this.brokerController = brokerController;\n        this.rtcConfig = rtcConfig;\n        this.Errors = new Array();\n        this.LocalStreams = new Array();\n        this.DataChannels = new Map();\n        this.Peers = new Map();\n        this.brokerController.On(\"contextSignal\", function (signal) {\n            var msg = JSON.parse(signal.message);\n            switch (msg.type) {\n                case \"offer\":\n                    _this.onOffer(signal);\n                    break;\n                case \"answer\":\n                    _this.onAnswer(signal);\n                    break;\n                case \"candidate\":\n                    _this.onCandidate(signal);\n                    break;\n            }\n        });\n        brokerController.On(\"contextCreated\", function (peer) {\n            _this.LocalPeerId = peer.peerId;\n            _this.Context = peer.context;\n            _this.OnContextCreated(peer);\n        });\n        brokerController.On(\"contextChanged\", function (context) {\n            _this.Context = context;\n            _this.OnContextChanged(context);\n        });\n        brokerController.On(\"connectTo\", function (peers) {\n            _this.onConnectTo(peers);\n        });\n    }\n    WebRTC.prototype.onConnectTo = function (peerConnections) {\n        this.Connect(peerConnections);\n    };\n    WebRTC.prototype.onConnected = function (peerId) {\n        this.OnContextConnected(this.findPeerConnection(peerId), this.getPeerConnection(peerId));\n    };\n    WebRTC.prototype.OnDisconnected = function (peerId) {\n        var peerConnection = this.getPeerConnection(peerId);\n        this.OnContextDisconnected(this.findPeerConnection(peerId), peerConnection);\n        peerConnection.close();\n        this.removePeerConnection(peerId);\n    };\n    WebRTC.prototype.setBandwithConstraints = function (videobandwidth, audiobandwidth) {\n        this.bandwidthConstraints = new BandwidthConstraints_1.BandwidthConstraints(videobandwidth, audiobandwidth);\n    };\n    WebRTC.prototype.setMediaBitrates = function (sdp) {\n        return this.setMediaBitrate(this.setMediaBitrate(sdp, \"video\", this.bandwidthConstraints.videobandwidth), \"audio\", this.bandwidthConstraints.audiobandwidth);\n    };\n    WebRTC.prototype.setMediaBitrate = function (sdp, media, bitrate) {\n        var lines = sdp.split(\"\\n\");\n        var line = -1;\n        for (var i = 0; i < lines.length; i++) {\n            if (lines[i].indexOf(\"m=\" + media) === 0) {\n                line = i;\n                break;\n            }\n        }\n        if (line === -1) {\n            return sdp;\n        }\n        line++;\n        while (lines[line].indexOf(\"i=\") === 0 || lines[line].indexOf(\"c=\") === 0) {\n            line++;\n        }\n        if (lines[line].indexOf(\"b\") === 0) {\n            lines[line] = \"b=AS:\" + bitrate;\n            return lines.join(\"\\n\");\n        }\n        var newLines = lines.slice(0, line);\n        newLines.push(\"b=AS:\" + bitrate);\n        newLines = newLines.concat(lines.slice(line, lines.length));\n        return newLines.join(\"\\n\");\n    };\n    WebRTC.prototype.CreateDataChannel = function (name) {\n        var channel = new DataChannel_1.DataChannel(name);\n        this.DataChannels.set(name, channel);\n        return channel;\n    };\n    WebRTC.prototype.RemoveDataChannel = function (name) {\n        this.DataChannels.delete(name);\n    };\n    WebRTC.prototype.addError = function (err) {\n        this.OnError(err);\n    };\n    WebRTC.prototype.onCandidate = function (event) {\n        var _this = this;\n        var msg = JSON.parse(event.message);\n        var candidate = msg.iceCandidate;\n        var pc = this.getPeerConnection(event.sender);\n        pc.addIceCandidate(new RTCIceCandidate(candidate)).then(function () {\n        }).catch(function (err) {\n            _this.addError(err);\n        });\n    };\n    WebRTC.prototype.onAnswer = function (event) {\n        var _this = this;\n        var pc = this.getPeerConnection(event.sender);\n        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then(function (p) {\n        }).catch(function (err) {\n            _this.addError(err);\n        });\n    };\n    WebRTC.prototype.onOffer = function (event) {\n        var _this = this;\n        var pc = this.getPeerConnection(event.sender);\n        this.LocalStreams.forEach(function (stream) {\n            stream.getTracks().forEach(function (track) {\n                pc.addTrack(track, stream);\n            });\n        });\n        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));\n        pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: true }).then(function (description) {\n            pc.setLocalDescription(description).then(function () {\n                if (_this.bandwidthConstraints)\n                    description.sdp = _this.setMediaBitrates(description.sdp);\n                var answer = {\n                    sender: _this.LocalPeerId,\n                    recipient: event.sender,\n                    message: JSON.stringify(description)\n                };\n                _this.brokerController.Invoke(\"contextSignal\", answer);\n            }).catch(function (err) { return _this.addError(err); });\n        }).catch(function (err) { return _this.addError(err); });\n    };\n    WebRTC.prototype.AddLocalStream = function (stream) {\n        this.LocalStreams.push(stream);\n        return this;\n    };\n    WebRTC.prototype.AddIceServer = function (iceServer) {\n        this.rtcConfig.iceServers.push(iceServer);\n        return this;\n    };\n    WebRTC.prototype.removePeerConnection = function (id) {\n        this.Peers.delete(id);\n    };\n    WebRTC.prototype.createPeerConnection = function (id) {\n        var _this = this;\n        var rtcPeerConnection = new RTCPeerConnection(this.rtcConfig);\n        rtcPeerConnection.onsignalingstatechange = function (state) { };\n        rtcPeerConnection.onicecandidate = function (event) {\n            if (!event || !event.candidate)\n                return;\n            if (event.candidate) {\n                var msg = {\n                    sender: _this.LocalPeerId,\n                    recipient: id,\n                    message: JSON.stringify({\n                        type: 'candidate',\n                        iceCandidate: event.candidate\n                    })\n                };\n                _this.brokerController.Invoke(\"contextSignal\", msg);\n            }\n        };\n        rtcPeerConnection.oniceconnectionstatechange = function (event) {\n            switch (event.target.iceConnectionState) {\n                case \"connected\":\n                    _this.onConnected(id);\n                    break;\n                case \"disconnected\":\n                    _this.OnDisconnected(id);\n                    break;\n            }\n            ;\n        };\n        rtcPeerConnection.ontrack = function (event) {\n            var connection = _this.Peers.get(id);\n            connection.stream.addTrack(event.track);\n            _this.OnRemoteTrack(event.track, connection);\n        };\n        this.DataChannels.forEach(function (dataChannel) {\n            var pc = new PeerChannel_1.PeerChannel(id, rtcPeerConnection.createDataChannel(dataChannel.Name), dataChannel.Name);\n            dataChannel.addPeerChannel(pc);\n            rtcPeerConnection.ondatachannel = function (event) {\n                var channel = event.channel;\n                channel.onopen = function (event) {\n                    dataChannel.OnOpen(event, id);\n                };\n                channel.onclose = function (event) {\n                    dataChannel.removePeerChannel(id);\n                    dataChannel.OnClose(event, id);\n                };\n                channel.onmessage = function (message) {\n                    dataChannel.onMessage(message);\n                };\n            };\n        });\n        return rtcPeerConnection;\n    };\n    WebRTC.prototype.findPeerConnection = function (id) {\n        return this.Peers.get(id);\n    };\n    WebRTC.prototype.reconnectAll = function () {\n        throw \"not yet implemeted\";\n    };\n    WebRTC.prototype.getPeerConnection = function (id) {\n        var match = this.Peers.get(id);\n        if (!match) {\n            var pc = new WebRTCConnection_1.WebRTCConnection(id, this.createPeerConnection(id));\n            this.Peers.set(id, pc);\n            return pc.RTCPeer;\n        }\n        return match.RTCPeer;\n    };\n    WebRTC.prototype.createOffer = function (peer) {\n        var _this = this;\n        var peerConnection = this.createPeerConnection(peer.peerId);\n        this.LocalStreams.forEach(function (stream) {\n            stream.getTracks().forEach(function (track) {\n                peerConnection.addTrack(track, stream);\n            });\n            _this.OnLocalStream(stream);\n        });\n        peerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true }).then(function (description) {\n            peerConnection.setLocalDescription(description).then(function () {\n                if (_this.bandwidthConstraints)\n                    description.sdp = _this.setMediaBitrates(description.sdp);\n                var offer = {\n                    sender: _this.LocalPeerId,\n                    recipient: peer.peerId,\n                    message: JSON.stringify(description)\n                };\n                _this.brokerController.Invoke(\"contextSignal\", offer);\n            }).catch(function (err) {\n                _this.addError(err);\n            });\n        }).catch(function (err) {\n            _this.addError(err);\n        });\n        return peerConnection;\n    };\n    WebRTC.prototype.Disconnect = function () {\n        this.Peers.forEach(function (connection) {\n            connection.RTCPeer.close();\n        });\n        this.ChangeContext(Math.random().toString(36).substring(2));\n    };\n    WebRTC.prototype.DisconnectPeer = function (id) {\n        var peer = this.findPeerConnection(id);\n        peer.RTCPeer.close();\n    };\n    WebRTC.prototype.Connect = function (peerConnections) {\n        var _this = this;\n        peerConnections.forEach(function (peerConnection) {\n            var pc = new WebRTCConnection_1.WebRTCConnection(peerConnection.peerId, _this.createOffer(peerConnection));\n            _this.Peers.set(peerConnection.peerId, pc);\n        });\n        return this;\n    };\n    WebRTC.prototype.ChangeContext = function (context) {\n        this.brokerController.Invoke(\"changeContext\", { context: context });\n        return this;\n    };\n    WebRTC.prototype.ConnectPeers = function () {\n        this.brokerController.Invoke(\"connectContext\", {});\n    };\n    WebRTC.prototype.ConnectContext = function () {\n        this.ConnectPeers();\n    };\n    return WebRTC;\n}());\nexports.WebRTC = WebRTC;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/WebRTC/WebRTC.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/WebRTC/WebRTCConnection.js":
/*!**************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/WebRTC/WebRTCConnection.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar WebRTCConnection = (function () {\n    function WebRTCConnection(id, rtcPeerConnection) {\n        this.id = id;\n        this.RTCPeer = rtcPeerConnection;\n        this.stream = new MediaStream();\n    }\n    return WebRTCConnection;\n}());\nexports.WebRTCConnection = WebRTCConnection;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/WebRTC/WebRTCConnection.js?");

/***/ })

/******/ });