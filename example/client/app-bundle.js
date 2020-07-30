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
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst thor_io_client_vnext_1 = __webpack_require__(/*! thor-io.client-vnext */ \"./node_modules/thor-io.client-vnext/index.js\");\nclass TestClient {\n    constructor() {\n        this.factory = new thor_io_client_vnext_1.ClientFactory(\"ws://localhost:1337\", [\"example\"], {});\n        this.factory.onOpen = (controller) => {\n            this.controller = controller;\n            console.log(`a connection is made to example`, controller);\n            controller.connect();\n        };\n    }\n}\nexports.TestClient = TestClient;\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n    let testClient = new TestClient();\n    window[\"testClient\"] = testClient;\n});\n\n\n//# sourceURL=webpack:///./example/client.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/index.js":
/*!****************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar BandwidthConstraints_1 = __webpack_require__(/*! ./src/Utils/BandwidthConstraints */ \"./node_modules/thor-io.client-vnext/src/Utils/BandwidthConstraints.js\");\nexports.BandwidthConstraints = BandwidthConstraints_1.BandwidthConstraints;\nvar BinaryMessage_1 = __webpack_require__(/*! ./src/Messages/BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nexports.BinaryMessage = BinaryMessage_1.BinaryMessage;\nvar DataChannel_1 = __webpack_require__(/*! ./src/DataChannels/DataChannel */ \"./node_modules/thor-io.client-vnext/src/DataChannels/DataChannel.js\");\nexports.DataChannel = DataChannel_1.DataChannel;\nvar ClientFactory_1 = __webpack_require__(/*! ./src/Factory/ClientFactory */ \"./node_modules/thor-io.client-vnext/src/Factory/ClientFactory.js\");\nexports.ClientFactory = ClientFactory_1.ClientFactory;\nvar TextMessage_1 = __webpack_require__(/*! ./src/Messages/TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nexports.TextMessage = TextMessage_1.TextMessage;\nvar Listener_1 = __webpack_require__(/*! ./src/Events/Listener */ \"./node_modules/thor-io.client-vnext/src/Events/Listener.js\");\nexports.Listener = Listener_1.Listener;\nvar PeerChannel_1 = __webpack_require__(/*! ./src/DataChannels/PeerChannel */ \"./node_modules/thor-io.client-vnext/src/DataChannels/PeerChannel.js\");\nexports.PeerChannel = PeerChannel_1.PeerChannel;\nvar PropertyMessage_1 = __webpack_require__(/*! ./src/Messages/PropertyMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js\");\nexports.PropertyMessage = PropertyMessage_1.PropertyMessage;\nvar Utils_1 = __webpack_require__(/*! ./src/Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nexports.Utils = Utils_1.Utils;\nvar WebRTCFactory_1 = __webpack_require__(/*! ./src/Factory/WebRTCFactory */ \"./node_modules/thor-io.client-vnext/src/Factory/WebRTCFactory.js\");\nexports.WebRTCFactory = WebRTCFactory_1.WebRTCFactory;\nvar ThorIOConnection_1 = __webpack_require__(/*! ./src/Factory/Models/ThorIOConnection */ \"./node_modules/thor-io.client-vnext/src/Factory/Models/ThorIOConnection.js\");\nexports.ThorIOConnection = ThorIOConnection_1.ThorIOConnection;\nvar Controller_1 = __webpack_require__(/*! ./src/Controller/Controller */ \"./node_modules/thor-io.client-vnext/src/Controller/Controller.js\");\nexports.Controller = Controller_1.Controller;\nvar E2EEBase_1 = __webpack_require__(/*! ./src/E2EE/E2EEBase */ \"./node_modules/thor-io.client-vnext/src/E2EE/E2EEBase.js\");\nexports.E2EEBase = E2EEBase_1.E2EEBase;\nvar ContextConnection_1 = __webpack_require__(/*! ./src/Factory/Models/ContextConnection */ \"./node_modules/thor-io.client-vnext/src/Factory/Models/ContextConnection.js\");\nexports.ContextConnection = ContextConnection_1.ContextConnection;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/index.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Controller/Controller.js":
/*!************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Controller/Controller.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst TextMessage_1 = __webpack_require__(/*! ../Messages/TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nconst Listener_1 = __webpack_require__(/*! ../Events/Listener */ \"./node_modules/thor-io.client-vnext/src/Events/Listener.js\");\nclass Controller {\n    constructor(alias, ws) {\n        this.alias = alias;\n        this.ws = ws;\n        this.listeners = new Map();\n        this.isConnected = false;\n        this.on(\"___error\", (err) => {\n            this.onError(err);\n        });\n    }\n    onError(event) { }\n    onOpen(event) { }\n    onClose(event) { }\n    connect() {\n        this.ws.send(new TextMessage_1.TextMessage(\"___connect\", {}, this.alias, null, null, true).toString());\n        return this;\n    }\n    ;\n    close() {\n        this.ws.send(new TextMessage_1.TextMessage(\"___close\", {}, this.alias, null, null, true).toString());\n        return this;\n    }\n    ;\n    subscribe(topic, callback) {\n        this.ws.send(new TextMessage_1.TextMessage(\"___subscribe\", {\n            topic: topic,\n            controller: this.alias\n        }, this.alias).toString());\n        return this.on(topic, callback);\n    }\n    unsubscribe(topic) {\n        this.ws.send(new TextMessage_1.TextMessage(\"___unsubscribe\", {\n            topic: topic,\n            controller: this.alias\n        }, this.alias).toString());\n    }\n    on(topic, fn) {\n        let listener = new Listener_1.Listener(topic, fn);\n        this.listeners.set(topic, listener);\n        return listener;\n    }\n    of(topic) {\n        this.listeners.delete(topic);\n    }\n    findListener(topic) {\n        return this.listeners.get(topic);\n    }\n    invokeBinary(buffer) {\n        if (buffer instanceof ArrayBuffer) {\n            this.ws.send(buffer);\n            return this;\n        }\n        else {\n            throw (\"parameter provided must be an ArrayBuffer constructed by BinaryMessage\");\n        }\n    }\n    publishBinary(buffer) {\n        if (buffer instanceof ArrayBuffer) {\n            this.ws.send(buffer);\n            return this;\n        }\n        else {\n            throw (\"parameter provided must be an ArrayBuffer constructed by Client.BinaryMessage\");\n        }\n    }\n    invoke(method, data, controller) {\n        this.ws.send(new TextMessage_1.TextMessage(method, data, controller || this.alias, null, null, true).toString());\n        return this;\n    }\n    publish(topic, data, controller) {\n        this.invoke(topic, data, controller || this.alias);\n        return this;\n    }\n    setProperty(propName, propValue, controller) {\n        this.invoke(propName, propValue, controller || this.alias);\n        return this;\n    }\n    dispatch(topic, data, buffer) {\n        if (topic === \"___open\") {\n            this.isConnected = true;\n            this.onOpen(JSON.parse(data));\n            return;\n        }\n        else if (topic === \"___close\") {\n            this.onClose([JSON.parse(data)]);\n            this.isConnected = false;\n        }\n        else {\n            let listener = this.findListener(topic);\n            if (listener)\n                listener.fn(JSON.parse(data), buffer);\n        }\n    }\n}\nexports.Controller = Controller;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Controller/Controller.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/DataChannels/DataChannel.js":
/*!***************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/DataChannels/DataChannel.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst TextMessage_1 = __webpack_require__(/*! ../Messages/TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nconst DataChannelListner_1 = __webpack_require__(/*! ./DataChannelListner */ \"./node_modules/thor-io.client-vnext/src/DataChannels/DataChannelListner.js\");\nconst BinaryMessage_1 = __webpack_require__(/*! ../Messages/BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nconst Utils_1 = __webpack_require__(/*! ../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nclass DataChannel {\n    constructor(label, listeners) {\n        this.Listners = listeners || new Map();\n        this.PeerChannels = new Map();\n        this.label = label;\n        this.messageFragments = new Map();\n    }\n    findListener(topic) {\n        let listener = Array.from(this.Listners.values()).find((pre) => {\n            return pre.channelName === this.label && pre.topic === topic;\n        });\n        return listener;\n    }\n    on(topic, fn) {\n        var listener = new DataChannelListner_1.DataChannelListner(this.label, topic, fn);\n        this.Listners.set(topic, listener);\n        return listener;\n    }\n    off(topic) {\n        return this.Listners.delete(topic);\n    }\n    onOpen(event, peerId, name) { }\n    onClose(event, peerId, name) { }\n    addMessageFragment(message) {\n        if (!this.messageFragments.has(message.I)) {\n            const data = { msg: message, receiveBuffer: new ArrayBuffer(0) };\n            data.receiveBuffer = Utils_1.Utils.joinBuffers(data.receiveBuffer, message.B);\n            this.messageFragments.set(message.I, data);\n        }\n        else {\n            let current = this.messageFragments.get(message.I);\n            current.receiveBuffer = Utils_1.Utils.joinBuffers(current.receiveBuffer, message.B);\n        }\n        if (message.F) {\n            let result = this.messageFragments.get(message.I);\n            result.msg.B = result.receiveBuffer;\n            this.dispatchMessage(result.msg);\n            this.messageFragments.delete(message.I);\n        }\n        message.B = new ArrayBuffer(0);\n    }\n    dispatchMessage(msg) {\n        let listener = this.findListener(msg.T);\n        listener && listener.fn.apply(this, [JSON.parse(msg.D), msg.B]);\n    }\n    onMessage(event) {\n        const isBinary = typeof (event.data) !== \"string\";\n        if (isBinary) {\n            this.addMessageFragment(BinaryMessage_1.BinaryMessage.fromArrayBuffer(event.data));\n        }\n        else {\n            this.dispatchMessage(JSON.parse(event.data));\n        }\n    }\n    close(name) {\n        this.PeerChannels.forEach((pc) => {\n            if (pc.dataChannel.label === name || this.label)\n                pc.dataChannel.close();\n        });\n    }\n    invoke(topic, data, isFinal, uuid) {\n        this.PeerChannels.forEach((channel) => {\n            if (channel.dataChannel.readyState === \"open\" && channel.label === this.label) {\n                channel.dataChannel.send(new TextMessage_1.TextMessage(topic, data, channel.label, null, uuid, isFinal).toString());\n            }\n        });\n        return this;\n    }\n    invokeBinary(topic, data, arrayBuffer, isFinal, uuid) {\n        let m = new TextMessage_1.TextMessage(topic, data, this.label, null, uuid, isFinal);\n        const message = new BinaryMessage_1.BinaryMessage(m.toString(), arrayBuffer);\n        this.PeerChannels.forEach((channel) => {\n            if (channel.dataChannel.readyState === \"open\" && channel.label === this.label) {\n                channel.dataChannel.send(message.buffer);\n            }\n        });\n        return this;\n    }\n    addPeerChannel(pc) {\n        this.PeerChannels.set({\n            id: pc.peerId, name: pc.label\n        }, pc);\n    }\n    removePeerChannel(id) {\n        return this.PeerChannels.delete({ id: id, name: this.label });\n    }\n}\nexports.DataChannel = DataChannel;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/DataChannels/DataChannel.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/DataChannels/DataChannelListner.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/DataChannels/DataChannelListner.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Listener_1 = __webpack_require__(/*! ../Events/Listener */ \"./node_modules/thor-io.client-vnext/src/Events/Listener.js\");\nclass DataChannelListner extends Listener_1.Listener {\n    constructor(channelName, topic, fn) {\n        super(topic, fn);\n        this.channelName = channelName;\n        this.count = 0;\n    }\n}\nexports.DataChannelListner = DataChannelListner;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/DataChannels/DataChannelListner.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/DataChannels/PeerChannel.js":
/*!***************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/DataChannels/PeerChannel.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass PeerChannel {\n    constructor(peerId, dataChannel, label) {\n        this.peerId = peerId;\n        this.dataChannel = dataChannel;\n        this.label = label;\n    }\n}\nexports.PeerChannel = PeerChannel;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/DataChannels/PeerChannel.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/E2EE/E2EEBase.js":
/*!****************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/E2EE/E2EEBase.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass E2EEBase {\n    constructor(currentCryptoKey) {\n        this.currentCryptoKey = currentCryptoKey;\n        this.frameTypeToCryptoOffset = {\n            key: 10,\n            delta: 3,\n            undefined: 1,\n        };\n        this.useCryptoOffset = true;\n        this.currentKeyIdentifier = 0;\n        this.rcount = 0;\n        this.scount = 0;\n    }\n    setKey(key) {\n        this.currentCryptoKey = key;\n    }\n    dump(encodedFrame, direction, max = 16) {\n        const data = new Uint8Array(encodedFrame.data);\n        let bytes = '';\n        for (let j = 0; j < data.length && j < max; j++) {\n            bytes += (data[j] < 16 ? '0' : '') + data[j].toString(16) + ' ';\n        }\n        console.log(performance.now().toFixed(2), direction, bytes.trim(), 'len=' + encodedFrame.data.byteLength, 'type=' + (encodedFrame.type || 'audio'), 'ts=' + encodedFrame.timestamp, 'ssrc=' + encodedFrame.synchronizationSource);\n    }\n    encode(encodedFrame, controller) {\n        if (this.scount++ < 30) {\n            this.dump(encodedFrame, 'send');\n        }\n        if (this.currentCryptoKey) {\n            const view = new DataView(encodedFrame.data);\n            const newData = new ArrayBuffer(encodedFrame.data.byteLength + 5);\n            const newView = new DataView(newData);\n            const cryptoOffset = this.useCryptoOffset ? this.frameTypeToCryptoOffset[encodedFrame.type] : 0;\n            for (let i = 0; i < cryptoOffset && i < encodedFrame.data.byteLength; ++i) {\n                newView.setInt8(i, view.getInt8(i));\n            }\n            for (let i = cryptoOffset; i < encodedFrame.data.byteLength; ++i) {\n                const keyByte = this.currentCryptoKey.charCodeAt(i % this.currentCryptoKey.length);\n                newView.setInt8(i, view.getInt8(i) ^ keyByte);\n            }\n            newView.setUint8(encodedFrame.data.byteLength, this.currentKeyIdentifier % 0xff);\n            newView.setUint32(encodedFrame.data.byteLength + 1, 0xDEADBEEF);\n            encodedFrame.data = newData;\n        }\n        controller.enqueue(encodedFrame);\n    }\n    decode(encodedFrame, controller) {\n        if (this.rcount++ < 30) {\n            this.dump(encodedFrame, 'recv');\n        }\n        const view = new DataView(encodedFrame.data);\n        const checksum = encodedFrame.data.byteLength > 4 ? view.getUint32(encodedFrame.data.byteLength - 4) : false;\n        if (this.currentCryptoKey) {\n            if (checksum !== 0xDEADBEEF) {\n                console.log('Corrupted frame received, checksum ' +\n                    checksum.toString(16));\n                return;\n            }\n            const keyIdentifier = view.getUint8(encodedFrame.data.byteLength - 5);\n            if (keyIdentifier !== this.currentKeyIdentifier) {\n                console.log(`Key identifier mismatch, got ${keyIdentifier} expected ${this.currentKeyIdentifier}.`);\n                return;\n            }\n            const newData = new ArrayBuffer(encodedFrame.data.byteLength - 5);\n            const newView = new DataView(newData);\n            const cryptoOffset = this.useCryptoOffset ? this.frameTypeToCryptoOffset[encodedFrame.type] : 0;\n            for (let i = 0; i < cryptoOffset; ++i) {\n                newView.setInt8(i, view.getInt8(i));\n            }\n            for (let i = cryptoOffset; i < encodedFrame.data.byteLength - 5; ++i) {\n                const keyByte = this.currentCryptoKey.charCodeAt(i % this.currentCryptoKey.length);\n                newView.setInt8(i, view.getInt8(i) ^ keyByte);\n            }\n            encodedFrame.data = newData;\n        }\n        else if (checksum === 0xDEADBEEF) {\n            return;\n        }\n        controller.enqueue(encodedFrame);\n    }\n}\nexports.E2EEBase = E2EEBase;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/E2EE/E2EEBase.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Events/Listener.js":
/*!******************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Events/Listener.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass Listener {\n    constructor(topic, fn) {\n        this.fn = fn;\n        this.topic = topic;\n        this.count = 0;\n    }\n}\nexports.Listener = Listener;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Events/Listener.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Factory/ClientFactory.js":
/*!************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Factory/ClientFactory.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst BinaryMessage_1 = __webpack_require__(/*! ../Messages/BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nconst Controller_1 = __webpack_require__(/*! ../Controller/Controller */ \"./node_modules/thor-io.client-vnext/src/Controller/Controller.js\");\nclass ClientFactory {\n    constructor(url, controllers, params) {\n        this.url = url;\n        this.controllers = new Map();\n        this.ws = new WebSocket(url + this.toQuery(params || {}));\n        this.ws.binaryType = \"arraybuffer\";\n        controllers.forEach(alias => {\n            this.controllers.set(alias, new Controller_1.Controller(alias, this.ws));\n        });\n        this.ws.onmessage = event => {\n            if (typeof (event.data) !== \"object\") {\n                let message = JSON.parse(event.data);\n                this.getController(message.C).dispatch(message.T, message.D);\n            }\n            else {\n                let message = BinaryMessage_1.BinaryMessage.fromArrayBuffer(event.data);\n                this.getController(message.C).dispatch(message.T, message.D, message.B);\n            }\n        };\n        this.ws.onclose = event => {\n            this.IsConnected = false;\n            this.onClose.apply(this, [event]);\n        };\n        this.ws.onerror = error => {\n            this.onError.apply(this, [error]);\n        };\n        this.ws.onopen = event => {\n            this.IsConnected = true;\n            this.onOpen.apply(this, Array.from(this.controllers.values()));\n        };\n    }\n    toQuery(obj) {\n        return `?${Object.keys(obj).map(key => (encodeURIComponent(key) + \"=\" +\n            encodeURIComponent(obj[key]))).join(\"&\")}`;\n    }\n    close() {\n        this.ws.close();\n    }\n    getController(alias) {\n        return this.controllers.get(alias);\n    }\n    removeController(alias) {\n        this.controllers.delete(alias);\n    }\n    onOpen(controllers) { }\n    onError(error) { }\n    onClose(event) { }\n}\nexports.ClientFactory = ClientFactory;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Factory/ClientFactory.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Factory/Models/ContextConnection.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Factory/Models/ContextConnection.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass ContextConnection {\n}\nexports.ContextConnection = ContextConnection;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Factory/Models/ContextConnection.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Factory/Models/ThorIOConnection.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Factory/Models/ThorIOConnection.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Utils_1 = __webpack_require__(/*! ../../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nclass ThorIOConnection {\n    constructor(id, rtcPeerConnection) {\n        this.id = id;\n        this.peerConnection = rtcPeerConnection;\n        this.uuid = Utils_1.Utils.newGuid();\n    }\n    getSenders() {\n        return this.peerConnection.getSenders();\n    }\n    getReceivers() {\n        return this.peerConnection.getReceivers();\n    }\n    getTransceivers() {\n        return this.peerConnection.getTransceivers();\n    }\n}\nexports.ThorIOConnection = ThorIOConnection;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Factory/Models/ThorIOConnection.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Factory/WebRTCFactory.js":
/*!************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Factory/WebRTCFactory.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst ThorIOConnection_1 = __webpack_require__(/*! ./Models/ThorIOConnection */ \"./node_modules/thor-io.client-vnext/src/Factory/Models/ThorIOConnection.js\");\nconst BandwidthConstraints_1 = __webpack_require__(/*! ../Utils/BandwidthConstraints */ \"./node_modules/thor-io.client-vnext/src/Utils/BandwidthConstraints.js\");\nconst DataChannel_1 = __webpack_require__(/*! ../DataChannels/DataChannel */ \"./node_modules/thor-io.client-vnext/src/DataChannels/DataChannel.js\");\nconst PeerChannel_1 = __webpack_require__(/*! ../DataChannels/PeerChannel */ \"./node_modules/thor-io.client-vnext/src/DataChannels/PeerChannel.js\");\nclass WebRTCFactory {\n    constructor(signalingController, rtcConfig, e2ee) {\n        this.signalingController = signalingController;\n        this.rtcConfig = rtcConfig;\n        if (e2ee) {\n            this.isEncrypted = true;\n            this.e2ee = e2ee;\n        }\n        else {\n            this.isEncrypted = false;\n        }\n        this.localStreams = new Array();\n        this.dataChannels = new Map();\n        this.peers = new Map();\n        this.signalingController.on(\"contextSignal\", (signal) => {\n            let msg = JSON.parse(signal.message);\n            switch (msg.type) {\n                case \"offer\":\n                    this.onOffer(signal, signal.skipLocalTracks || false);\n                    break;\n                case \"answer\":\n                    this.onAnswer(signal);\n                    break;\n                case \"candidate\":\n                    this.onCandidate(signal);\n                    break;\n            }\n        });\n        this.signalingController.on(\"contextCreated\", (peer) => {\n            this.localPeerId = peer.peerId;\n            this.context = peer.context;\n            this.onContextCreated(peer);\n        });\n        this.signalingController.on(\"contextChanged\", (context) => {\n            this.context = context;\n            this.onContextChanged(context);\n        });\n        this.signalingController.on(\"connectTo\", (peers) => {\n            this.onConnectAll(peers);\n        });\n    }\n    onConnectAll(peerConnections) {\n        this.connect(peerConnections);\n    }\n    onConnected(peerId) {\n        if (this.onContextConnected)\n            this.onContextConnected(this.findPeerConnection(peerId), this.getOrCreateRTCPeerConnection(peerId));\n    }\n    onDisconnected(peerId) {\n        let peerConnection = this.getOrCreateRTCPeerConnection(peerId);\n        if (this.onContextDisconnected)\n            this.onContextDisconnected(this.findPeerConnection(peerId), peerConnection);\n        peerConnection.close();\n        this.removePeerConnection(peerId);\n    }\n    addTrackToPeers(track) {\n        this.peers.forEach((p) => {\n            let pc = p.peerConnection;\n            pc.onnegotiationneeded = (e) => {\n                pc.createOffer()\n                    .then(offer => pc.setLocalDescription(offer))\n                    .then(() => {\n                    let offer = {\n                        sender: this.localPeerId,\n                        recipient: p.id,\n                        message: JSON.stringify(pc.localDescription),\n                        skipLocalTracks: true\n                    };\n                    this.signalingController.invoke(\"contextSignal\", offer);\n                });\n            };\n            p.peerConnection.addTrack(track);\n        });\n    }\n    removeTrackFromPeers(track) {\n        this.peers.forEach((p) => {\n            let sender = p.getSenders().find((sender) => {\n                return sender.track.id === track.id;\n            });\n            p.peerConnection.removeTrack(sender);\n        });\n    }\n    getRtpSenders(peerId) {\n        if (!this.peers.has(peerId))\n            throw \"Cannot find the peer\";\n        return this.peers.get(peerId).getSenders();\n    }\n    getRtpReceivers(peerId) {\n        if (!this.peers.has(peerId))\n            throw \"Cannot find the peer\";\n        return this.peers.get(peerId).getReceivers();\n    }\n    setBandwithConstraints(videobandwidth, audiobandwidth) {\n        this.bandwidthConstraints = new BandwidthConstraints_1.BandwidthConstraints(videobandwidth, audiobandwidth);\n    }\n    setMediaBitrates(sdp) {\n        return this.setMediaBitrate(this.setMediaBitrate(sdp, \"video\", this.bandwidthConstraints.videobandwidth), \"audio\", this.bandwidthConstraints.audiobandwidth);\n    }\n    setMediaBitrate(sdp, media, bitrate) {\n        let lines = sdp.split(\"\\n\");\n        let line = -1;\n        for (let i = 0; i < lines.length; i++) {\n            if (lines[i].indexOf(\"m=\" + media) === 0) {\n                line = i;\n                break;\n            }\n        }\n        if (line === -1) {\n            return sdp;\n        }\n        line++;\n        while (lines[line].indexOf(\"i=\") === 0 || lines[line].indexOf(\"c=\") === 0) {\n            line++;\n        }\n        if (lines[line].indexOf(\"b\") === 0) {\n            lines[line] = \"b=AS:\" + bitrate;\n            return lines.join(\"\\n\");\n        }\n        var newLines = lines.slice(0, line);\n        newLines.push(\"b=AS:\" + bitrate);\n        newLines = newLines.concat(lines.slice(line, lines.length));\n        return newLines.join(\"\\n\");\n    }\n    createDataChannel(name) {\n        let channel = new DataChannel_1.DataChannel(name);\n        this.dataChannels.set(name, channel);\n        return channel;\n    }\n    removeDataChannel(name) {\n        this.dataChannels.delete(name);\n    }\n    addError(err) {\n        this.onError(err);\n    }\n    onCandidate(event) {\n        let msg = JSON.parse(event.message);\n        let candidate = msg.iceCandidate;\n        let pc = this.getOrCreateRTCPeerConnection(event.sender);\n        pc.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {\n        }).catch((err) => {\n            this.addError(err);\n        });\n    }\n    onAnswer(event) {\n        let pc = this.getOrCreateRTCPeerConnection(event.sender);\n        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then((p) => {\n        }).catch((err) => {\n            this.addError(err);\n        });\n    }\n    onOffer(event, skipLocalTracks) {\n        let pc = this.getOrCreateRTCPeerConnection(event.sender);\n        if (!skipLocalTracks) {\n            this.localStreams.forEach((stream) => {\n                stream.getTracks().forEach((track) => {\n                    let rtpSender = pc.addTrack(track, stream);\n                    if (this.isEncrypted) {\n                        let streams = rtpSender.createEncodedStreams();\n                        streams.readableStream\n                            .pipeThrough(new TransformStream({\n                            transform: this.e2ee.encode.bind(this.e2ee),\n                        }))\n                            .pipeTo(streams.writableStream);\n                    }\n                });\n            });\n        }\n        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));\n        pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: true }).then((description) => {\n            pc.setLocalDescription(description).then(() => {\n                if (this.bandwidthConstraints)\n                    description.sdp = this.setMediaBitrates(description.sdp);\n                let answer = {\n                    sender: this.localPeerId,\n                    recipient: event.sender,\n                    message: JSON.stringify(description)\n                };\n                this.signalingController.invoke(\"contextSignal\", answer);\n            }).catch((err) => this.addError(err));\n        }).catch((err) => this.addError(err));\n    }\n    addLocalStream(stream) {\n        this.localStreams.push(stream);\n        return this;\n    }\n    addIceServer(iceServer) {\n        this.rtcConfig.iceServers.push(iceServer);\n        return this;\n    }\n    removePeerConnection(id) {\n        this.peers.delete(id);\n    }\n    createRTCPeerConnection(id) {\n        let config;\n        if (this.isEncrypted) {\n            config = this.rtcConfig;\n            config.encodedInsertableStreams = true;\n            config.forceEncodedVideoInsertableStreams = true;\n            config.forceEncodedAudioInsertableStreams = true;\n        }\n        else {\n            config = this.rtcConfig;\n        }\n        let rtcPeerConnection = new RTCPeerConnection(config);\n        rtcPeerConnection.onsignalingstatechange = (state) => { };\n        rtcPeerConnection.onicecandidate = (event) => {\n            if (!event || !event.candidate)\n                return;\n            if (event.candidate) {\n                let msg = {\n                    sender: this.localPeerId,\n                    recipient: id,\n                    message: JSON.stringify({\n                        type: 'candidate',\n                        iceCandidate: event.candidate\n                    })\n                };\n                this.signalingController.invoke(\"contextSignal\", msg);\n            }\n        };\n        rtcPeerConnection.oniceconnectionstatechange = (event) => {\n            switch (event.target.iceConnectionState) {\n                case \"connected\":\n                    this.onConnected(id);\n                    break;\n                case \"disconnected\":\n                    this.cleanUp(id);\n                    this.onDisconnected(id);\n                    break;\n            }\n        };\n        rtcPeerConnection.ontrack = (event) => {\n            const track = event.track;\n            const kind = event.track.kind;\n            const connection = this.peers.get(id);\n            event.track.onended = (e) => {\n                if (this.onRemoteTrackLost)\n                    this.onRemoteTrackLost(track, connection, e);\n            };\n            if (kind === \"video\" && this.onRemoteVideoTrack) {\n                this.onRemoteVideoTrack(track, connection, event);\n            }\n            else if (kind === \"audio\" && this.onRemoteAudioTrack) {\n                this.onRemoteAudioTrack(track, connection, event);\n            }\n            if (this.onRemoteTrack)\n                this.onRemoteTrack(track, connection, event);\n        };\n        this.dataChannels.forEach((dataChannel) => {\n            let pc = new PeerChannel_1.PeerChannel(id, rtcPeerConnection.createDataChannel(dataChannel.label), dataChannel.label);\n            dataChannel.addPeerChannel(pc);\n            rtcPeerConnection.ondatachannel = (event) => {\n                let channel = event.channel;\n                channel.onopen = (event) => {\n                    this.dataChannels.get(channel.label).onOpen(event, id, channel.label);\n                };\n                channel.onclose = (event) => {\n                    this.dataChannels.get(channel.label).removePeerChannel(id);\n                    this.dataChannels.get(channel.label).onClose(event, id, channel.label);\n                };\n                channel.onmessage = (message) => {\n                    this.dataChannels.get(channel.label).onMessage(message);\n                };\n            };\n        });\n        return rtcPeerConnection;\n    }\n    cleanUp(id) {\n        this.dataChannels.forEach((d) => {\n            d.removePeerChannel(id);\n        });\n    }\n    findPeerConnection(id) {\n        return this.peers.get(id);\n    }\n    reconnectAll() {\n        throw \"not yet implemeted\";\n    }\n    getOrCreateRTCPeerConnection(id) {\n        let match = this.peers.get(id);\n        if (!match) {\n            let pc = new ThorIOConnection_1.ThorIOConnection(id, this.createRTCPeerConnection(id));\n            this.peers.set(id, pc);\n            return pc.peerConnection;\n        }\n        return match.peerConnection;\n    }\n    createOffer(peer) {\n        let peerConnection = this.createRTCPeerConnection(peer.peerId);\n        this.localStreams.forEach((stream) => {\n            stream.getTracks().forEach((track) => {\n                const rtpSender = peerConnection.addTrack(track, stream);\n                if (this.isEncrypted) {\n                    let senderStreams = rtpSender.createEncodedStreams();\n                    senderStreams.readableStream\n                        .pipeThrough(new TransformStream({\n                        transform: this.e2ee.encode.bind(this.e2ee),\n                    }))\n                        .pipeTo(senderStreams.writableStream);\n                }\n            });\n            if (this.onLocalStream)\n                this.onLocalStream(stream);\n        });\n        peerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true }).then((description) => {\n            peerConnection.setLocalDescription(description).then(() => {\n                if (this.bandwidthConstraints)\n                    description.sdp = this.setMediaBitrates(description.sdp);\n                let offer = {\n                    sender: this.localPeerId,\n                    recipient: peer.peerId,\n                    message: JSON.stringify(description)\n                };\n                this.signalingController.invoke(\"contextSignal\", offer);\n            }).catch((err) => {\n                this.addError(err);\n            });\n        }).catch((err) => {\n            this.addError(err);\n        });\n        return peerConnection;\n    }\n    disconnect() {\n        this.peers.forEach((connection) => {\n            connection.peerConnection.close();\n        });\n        this.changeContext(Math.random().toString(36).substring(2));\n    }\n    disconnectPeer(id) {\n        let peer = this.findPeerConnection(id);\n        peer.peerConnection.close();\n    }\n    connect(peerConnections) {\n        peerConnections.forEach((peerConnection) => {\n            this.connectTo(peerConnection);\n        });\n    }\n    connectTo(peerConnection) {\n        let pc = new ThorIOConnection_1.ThorIOConnection(peerConnection.peerId, this.createOffer(peerConnection));\n        if (!this.peers.has(peerConnection.peerId))\n            this.peers.set(peerConnection.peerId, pc);\n    }\n    changeContext(context) {\n        this.signalingController.invoke(\"changeContext\", { context: context });\n        return this;\n    }\n    connectPeers() {\n        this.signalingController.invoke(\"connectContext\", {});\n    }\n    connectContext() {\n        this.connectPeers();\n    }\n}\nexports.WebRTCFactory = WebRTCFactory;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Factory/WebRTCFactory.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js":
/*!*************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Utils_1 = __webpack_require__(/*! ../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nconst TextMessage_1 = __webpack_require__(/*! ./TextMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js\");\nclass BinaryMessage {\n    constructor(message, arrayBuffer) {\n        this.arrayBuffer = arrayBuffer;\n        this.header = new Uint8Array(Utils_1.Utils.longToArray(message.length));\n        this.buffer = Utils_1.Utils.joinBuffers(Utils_1.Utils.joinBuffers(this.header.buffer, Utils_1.Utils.stingToBuffer(message).buffer), arrayBuffer);\n    }\n    static fromArrayBuffer(buffer) {\n        let bytes = new Uint8Array(buffer);\n        let header = bytes.slice(0, 8);\n        let payloadLength = Utils_1.Utils.arrayToLong(header);\n        let start = header.byteLength + payloadLength;\n        let bytesMessage = bytes.slice(header.byteLength, start);\n        let stop = buffer.byteLength;\n        let messageBuffer = bytes.slice(start, stop);\n        let textMessage = String.fromCharCode.apply(null, new Uint16Array(bytesMessage));\n        let message = JSON.parse(textMessage);\n        return new TextMessage_1.TextMessage(message.T, message.D, message.C, messageBuffer, message.I, message.F);\n    }\n}\nexports.BinaryMessage = BinaryMessage;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js":
/*!***************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Utils_1 = __webpack_require__(/*! ../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nclass PropertyMessage {\n    constructor() {\n        this.messageId = Utils_1.Utils.newGuid();\n    }\n}\nexports.PropertyMessage = PropertyMessage;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Messages/PropertyMessage.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js":
/*!***********************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst BinaryMessage_1 = __webpack_require__(/*! ./BinaryMessage */ \"./node_modules/thor-io.client-vnext/src/Messages/BinaryMessage.js\");\nconst Utils_1 = __webpack_require__(/*! ../Utils/Utils */ \"./node_modules/thor-io.client-vnext/src/Utils/Utils.js\");\nclass TextMessage {\n    constructor(topic, object, controller, buffer, uuid, isFinal) {\n        this.D = object;\n        this.T = topic;\n        this.C = controller;\n        this.B = buffer;\n        this.I = uuid || Utils_1.Utils.newGuid();\n        this.F = isFinal;\n    }\n    toJSON() {\n        return {\n            T: this.T,\n            D: JSON.stringify(this.D),\n            C: this.C,\n            I: this.I,\n            F: this.F\n        };\n    }\n    toString() {\n        return JSON.stringify(this.toJSON());\n    }\n    static fromArrayBuffer(buffer) {\n        return BinaryMessage_1.BinaryMessage.fromArrayBuffer(buffer);\n    }\n}\nexports.TextMessage = TextMessage;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Messages/TextMessage.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Utils/BandwidthConstraints.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Utils/BandwidthConstraints.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass BandwidthConstraints {\n    constructor(videobandwidth, audiobandwidth) {\n        this.videobandwidth = videobandwidth;\n        this.audiobandwidth = audiobandwidth;\n    }\n}\nexports.BandwidthConstraints = BandwidthConstraints;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Utils/BandwidthConstraints.js?");

/***/ }),

/***/ "./node_modules/thor-io.client-vnext/src/Utils/Utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/thor-io.client-vnext/src/Utils/Utils.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nclass Utils {\n    static stingToBuffer(str) {\n        let len = str.length;\n        var arr = new Array(len);\n        for (let i = 0; i < len; i++) {\n            arr[i] = str.charCodeAt(i) & 0xFF;\n        }\n        return new Uint8Array(arr);\n    }\n    static arrayToLong(byteArray) {\n        var value = 0;\n        let byteLength = byteArray.byteLength;\n        for (let i = byteLength - 1; i >= 0; i--) {\n            value = (value * 256) + byteArray[i];\n        }\n        return value;\n    }\n    static longToArray(long) {\n        var byteArray = new Uint8Array(8);\n        let byteLength = byteArray.length;\n        for (let index = 0; index < byteLength; index++) {\n            let byte = long & 0xff;\n            byteArray[index] = byte;\n            long = (long - byte) / 256;\n        }\n        return byteArray;\n    }\n    static newGuid() {\n        const s4 = () => {\n            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);\n        };\n        return s4() + s4() + \"-\" + s4() + \"-\" + s4() + \"-\" + s4() + \"-\" + s4() + s4() + s4();\n    }\n    static newRandomString(length) {\n        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);\n    }\n    static joinBuffers(a, b) {\n        let newBuffer = new Uint8Array(a.byteLength + b.byteLength);\n        newBuffer.set(new Uint8Array(a), 0);\n        newBuffer.set(new Uint8Array(b), a.byteLength);\n        return newBuffer.buffer;\n    }\n}\nexports.Utils = Utils;\n\n\n//# sourceURL=webpack:///./node_modules/thor-io.client-vnext/src/Utils/Utils.js?");

/***/ })

/******/ });