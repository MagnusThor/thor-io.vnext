var ThorIO;
(function (ThorIO) {
    var Client;
    (function (Client) {
        var Message = (function () {
            function Message(topic, object, controller, id) {
                this.D = object;
                this.T = topic;
                this.C = controller;
            }
            Object.defineProperty(Message.prototype, "JSON", {
                get: function () {
                    return {
                        T: this.T,
                        D: JSON.stringify(this.D),
                        C: this.C
                    };
                },
                enumerable: true,
                configurable: true
            });
            ;
            Message.prototype.toString = function () {
                return JSON.stringify(this.JSON);
            };
            return Message;
        }());
        Client.Message = Message;
        var PeerConnection = (function () {
            function PeerConnection() {
            }
            return PeerConnection;
        }());
        Client.PeerConnection = PeerConnection;
        var Connection = (function () {
            function Connection(id, rtcPeerConnection) {
                this.id = id;
                this.rtcPeerConnection = rtcPeerConnection;
                this.streams = new Array();
            }
            return Connection;
        }());
        Client.Connection = Connection;
        var WebRTC = (function () {
            function WebRTC(brokerProxy, rtcConfig) {
                var _this = this;
                this.brokerProxy = brokerProxy;
                this.rtcConfig = rtcConfig;
                this.Errors = new Array();
                this.Peers = new Array();
                this.localSteams = new Array();
                this.signalHandlers();
                brokerProxy.On("contextCreated", function (p) {
                    _this.onContextCreated(p);
                });
                brokerProxy.On("contextChanged", function (p) {
                    _this.onContextChanged(p);
                });
                brokerProxy.On("connectTo", function (p) {
                    _this.onConnectTo(p);
                });
            }
            WebRTC.prototype.signalHandlers = function () {
                var _this = this;
                this.brokerProxy.On("contextSignal", function (signal) {
                    var msg = JSON.parse(signal.message);
                    switch (msg.type) {
                        case "offer":
                            _this.onOffer(signal);
                            break;
                        case "answer":
                            _this.onAnswer(signal);
                            break;
                        case "candidate":
                            _this.onCandidate(signal);
                            break;
                        default:
                            break;
                    }
                });
            };
            WebRTC.prototype.addError = function (err) {
                this.addError(err);
                this.onError(err);
            };
            WebRTC.prototype.onError = function (err) { };
            WebRTC.prototype.onContextCreated = function (peerConnection) {
            };
            WebRTC.prototype.onContextChanged = function (context) { };
            WebRTC.prototype.onRemoteStream = function (stream, connection) { };
            ;
            WebRTC.prototype.onRemoteStreamlost = function (streamId, peerId) { };
            WebRTC.prototype.onLocalSteam = function (stream) { };
            ;
            WebRTC.prototype.onContextConnected = function (rtcPeerConnection) { };
            WebRTC.prototype.onContextDisconnected = function (rtcPeerConnection) { };
            WebRTC.prototype.onConnectTo = function (peerConnections) {
                this.connect(peerConnections);
            };
            WebRTC.prototype.onConnected = function (peerId) {
                this.onContextConnected(this.getPeerConnection(peerId));
            };
            WebRTC.prototype.onDisconnected = function (peerId) {
                var pc = this.getPeerConnection(peerId);
                pc.close();
                this.onContextDisconnected(pc);
                this.removePeerConnection(peerId);
            };
            WebRTC.prototype.onCandidate = function (event) {
                var _this = this;
                var msg = JSON.parse(event.message);
                var candidate = msg.iceCandidate;
                var pc = this.getPeerConnection(event.sender);
                pc.addIceCandidate(new RTCIceCandidate({
                    sdpMLineIndex: candidate.label,
                    candidate: candidate.candidate
                })).then(function () {
                }).catch(function (err) {
                    _this.addError(err);
                });
            };
            WebRTC.prototype.onAnswer = function (event) {
                var _this = this;
                var pc = this.getPeerConnection(event.sender);
                pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then(function (p) {
                }).catch(function (err) {
                    _this.addError(err);
                });
            };
            WebRTC.prototype.onOffer = function (event) {
                var _this = this;
                var pc = this.getPeerConnection(event.sender);
                this.localSteams.forEach(function (stream) {
                    pc.addStream(stream);
                });
                pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));
                pc.createAnswer(function (description) {
                    pc.setLocalDescription(description);
                    var answer = {
                        sender: _this.localPeerId,
                        recipient: event.sender,
                        message: JSON.stringify(description)
                    };
                    _this.brokerProxy.Invoke("contextSignal", answer);
                }, function (err) {
                    _this.addError(err);
                }, {
                    mandatory: {
                        "offerToReceiveAudio": true,
                        "offerToReceiveVideo": true
                    }
                });
            };
            WebRTC.prototype.addLocalStream = function (stream) {
                this.localSteams.push(stream);
                return this;
            };
            WebRTC.prototype.addIceServer = function (iceServer) {
                this.rtcConfig.iceServers.push(iceServer);
                return this;
            };
            WebRTC.prototype.removePeerConnection = function (id) {
                var _this = this;
                var connection = this.Peers.filter(function (conn) {
                    return conn.id === id;
                })[0];
                connection.streams.forEach(function (stream) {
                    _this.onRemoteStreamlost(stream.id, connection.id);
                });
                var index = this.Peers.indexOf(connection);
                if (index > -1)
                    this.Peers.splice(index, 1);
            };
            WebRTC.prototype.createPeerConnection = function (id) {
                var _this = this;
                var rtcPeerConnection = new RTCPeerConnection(this.rtcConfig);
                rtcPeerConnection.onsignalingstatechange = function (state) { };
                rtcPeerConnection.onicecandidate = function (event) {
                    if (!event || !event.candidate)
                        return;
                    if (event.candidate) {
                        var msg = {
                            sender: _this.localPeerId,
                            recipient: id,
                            message: JSON.stringify({
                                type: 'candidate',
                                iceCandidate: event.candidate
                            })
                        };
                        _this.brokerProxy.Invoke("contextSignal", msg);
                    }
                };
                rtcPeerConnection.oniceconnectionstatechange = function (event) {
                    switch (event.target.iceConnectionState) {
                        case "connected":
                            _this.onConnected(id);
                            break;
                        case "disconnected":
                            _this.onDisconnected(id);
                            break;
                    }
                    ;
                };
                rtcPeerConnection.onaddstream = function (event) {
                    var connection = _this.Peers.filter(function (p) {
                        return p.id === id;
                    })[0];
                    connection.streams.push(event.stream);
                    _this.onRemoteStream(event.stream, connection);
                };
                return rtcPeerConnection;
            };
            WebRTC.prototype.getPeerConnection = function (id) {
                var match = this.Peers.find(function (connection) {
                    return connection.id === id;
                });
                if (match) {
                    var pc = new Connection(id, this.createPeerConnection(id));
                    this.Peers.push(pc);
                    return pc.rtcPeerConnection;
                }
                return match.rtcPeerConnection;
            };
            WebRTC.prototype.createOffer = function (peer) {
                var _this = this;
                var peerConnection = this.createPeerConnection(peer.peerId);
                this.localSteams.forEach(function (stream) {
                    peerConnection.addStream(stream);
                    _this.onLocalSteam(stream);
                });
                peerConnection.createOffer(function (localDescription) {
                    peerConnection.setLocalDescription(localDescription, function () {
                        var offer = {
                            sender: _this.localPeerId,
                            recipient: peer.peerId,
                            message: JSON.stringify(localDescription)
                        };
                        _this.brokerProxy.Invoke("contextSignal", offer);
                    }, function (err) {
                        _this.addError(err);
                    });
                }, function (err) {
                    _this.addError(err);
                }, {
                    mandatory: {
                        "offerToReceiveAudio": true,
                        "offerToReceiveVideo": true
                    }
                });
                return peerConnection;
            };
            WebRTC.prototype.disconnect = function () {
                this.Peers.forEach(function (p) {
                    p.rtcPeerConnection.close();
                });
                this.changeContext(Math.random().toString(36).substring(2));
            };
            WebRTC.prototype.connect = function (peerConnections) {
                var _this = this;
                peerConnections.forEach(function (peer) {
                    var pc = new Connection(peer.peerId, _this.createOffer(peer));
                    _this.Peers.push(pc);
                });
                return this;
            };
            WebRTC.prototype.changeContext = function (context) {
                this.brokerProxy.Invoke("changeContext", { context: context });
                return this;
            };
            WebRTC.prototype.connectPeers = function () {
                this.brokerProxy.Invoke("connectContext", {});
            };
            WebRTC.prototype.connectContext = function () {
                this.connectPeers();
            };
            return WebRTC;
        }());
        Client.WebRTC = WebRTC;
        var Factory = (function () {
            function Factory(url, controllers, params) {
                var _this = this;
                this.url = url;
                this.proxys = new Array();
                this.ws = new WebSocket(url + this.toQuery(params || {}));
                controllers.forEach(function (alias) {
                    _this.proxys.push(new Proxy(alias, _this.ws));
                });
                this.ws.onmessage = function (event) {
                    var message = JSON.parse(event.data);
                    _this.GetProxy(message.C).Dispatch(message.T, message.D);
                };
                this.ws.onclose = function (event) {
                    _this.IsConnected = false;
                    _this.OnClose.apply(_this, [event]);
                };
                this.ws.onerror = function (error) {
                    _this.OnError.apply(_this, [error]);
                };
                this.ws.onopen = function (event) {
                    _this.IsConnected = true;
                    _this.OnOpen.apply(_this, _this.proxys);
                };
            }
            Factory.prototype.toQuery = function (obj) {
                return "?" + Object.keys(obj).map(function (key) { return (encodeURIComponent(key) + "=" +
                    encodeURIComponent(obj[key])); }).join("&");
            };
            Factory.prototype.Close = function () {
                this.ws.close();
            };
            ;
            Factory.prototype.GetProxy = function (alias) {
                var channel = this.proxys.filter(function (pre) { return (pre.alias === alias); });
                return channel[0];
            };
            ;
            Factory.prototype.RemoveProxy = function (alias) {
                var index = this.proxys.indexOf(this.GetProxy(alias));
                this.proxys.splice(index, 1);
            };
            Factory.prototype.OnOpen = function (proxys) { };
            ;
            Factory.prototype.OnError = function (error) { };
            Factory.prototype.OnClose = function (event) { };
            return Factory;
        }());
        Client.Factory = Factory;
        var Listener = (function () {
            function Listener(topic, fn) {
                this.fn = fn;
                this.topic = topic;
                this.count = 0;
            }
            return Listener;
        }());
        Client.Listener = Listener;
        var Utils = (function () {
            function Utils() {
            }
            Utils.newGuid = function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }
                return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
            };
            return Utils;
        }());
        Client.Utils = Utils;
        var PromisedMessage = (function () {
            function PromisedMessage(id, resolve) {
                this.messageId = id;
                this.resolve = resolve;
            }
            return PromisedMessage;
        }());
        Client.PromisedMessage = PromisedMessage;
        var PropertyMessage = (function () {
            function PropertyMessage() {
                this.messageId = ThorIO.Client.Utils.newGuid();
            }
            return PropertyMessage;
        }());
        Client.PropertyMessage = PropertyMessage;
        var Proxy = (function () {
            function Proxy(alias, ws) {
                var _this = this;
                this.alias = alias;
                this.ws = ws;
                this.promisedMessages = new Array();
                this.listeners = new Array();
                this.IsConnected = false;
                this.On("___getProperty", function (data) {
                    var prom = _this.promisedMessages.filter(function (pre) {
                        return pre.messageId === data.messageId;
                    })[0];
                    prom.resolve(data.value);
                    var index = _this.promisedMessages.indexOf(prom);
                    _this.promisedMessages.splice(index, 1);
                });
            }
            Proxy.prototype.OnOpen = function (event) { };
            ;
            Proxy.prototype.OnClose = function (event) { };
            ;
            Proxy.prototype.Connect = function () {
                this.ws.send(new ThorIO.Client.Message("___connect", {}, this.alias));
                return this;
            };
            ;
            Proxy.prototype.Close = function () {
                this.ws.send(new ThorIO.Client.Message("___close", {}, this.alias));
                return this;
            };
            ;
            Proxy.prototype.Subscribe = function (topic, callback) {
                this.ws.send(new ThorIO.Client.Message("___subscribe", {
                    topic: topic,
                    controller: this.alias
                }, this.alias));
                return this.On(topic, callback);
            };
            ;
            Proxy.prototype.Unsubscribe = function (topic) {
                this.ws.send(new ThorIO.Client.Message("___unsubscribe", {
                    topic: topic,
                    controller: this.alias
                }, this.alias));
            };
            ;
            Proxy.prototype.On = function (topic, fn) {
                var listener = new ThorIO.Client.Listener(topic, fn);
                this.listeners.push(listener);
                console.log("lst", listener);
                return listener;
            };
            ;
            Proxy.prototype.findListener = function (topic) {
                var listener = this.listeners.filter(function (pre) {
                    return pre.topic === topic;
                });
                return listener[0];
            };
            Proxy.prototype.Off = function (topic) {
                var index = this.listeners.indexOf(this.findListener(topic));
                if (index >= 0)
                    this.listeners.splice(index, 1);
            };
            ;
            Proxy.prototype.Invoke = function (topic, data, controller) {
                this.ws.send(new ThorIO.Client.Message(topic, data, controller || this.alias));
                return this;
            };
            ;
            Proxy.prototype.SetProperty = function (propName, propValue, controller) {
                this.Invoke(propName, propValue, controller || this.alias);
                return this;
            };
            ;
            Proxy.prototype.GetProperty = function (propName, controller) {
                var propInfo = new PropertyMessage();
                propInfo.name = propName;
                var wrapper = new PromisedMessage(propInfo.messageId, function () { });
                ;
                this.promisedMessages.push(wrapper);
                var promise = new Promise(function (resolve, reject) {
                    wrapper.resolve = resolve;
                });
                this.Invoke("___getProperty", propInfo, controller || this.alias);
                return promise;
            };
            Proxy.prototype.Dispatch = function (topic, data) {
                if (topic === "___open") {
                    this.IsConnected = true;
                    this.OnOpen(JSON.parse(data));
                    return;
                }
                else if (topic === "___close") {
                    this.OnClose([JSON.parse(data)]);
                    this.IsConnected = false;
                }
                else {
                    var listener = this.findListener(topic);
                    if (listener)
                        listener.fn(JSON.parse(data));
                }
            };
            ;
            return Proxy;
        }());
        Client.Proxy = Proxy;
    })(Client = ThorIO.Client || (ThorIO.Client = {}));
})(ThorIO || (ThorIO = {}));
//# sourceMappingURL=thor-io.client.js.map