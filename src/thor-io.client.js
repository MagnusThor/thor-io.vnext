var ThorIOClient;
(function (ThorIOClient) {
    var PeerConnection = (function () {
        function PeerConnection() {
        }
        return PeerConnection;
    }());
    var Connection = (function () {
        function Connection(id, rtcPeerConnection) {
            this.id = id;
            this.rtcPeerConnection = rtcPeerConnection;
            this.streams = new Array();
        }
        return Connection;
    }());
    var WebRTC = (function () {
        function WebRTC(brokerChannel) {
            var _this = this;
            this.brokerChannel = brokerChannel;
            this.Peers = new Array();
            this.localSteams = new Array();
            brokerChannel.On("contextSignal", function (signal) {
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
                }
            });
        }
        WebRTC.prototype.onCandidate = function (event) {
            var msg = JSON.parse(event.message);
            var candidate = msg.iceCandidate;
            var pc = this.getPeerConnection(event.sender);
            pc.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.label,
                candidate: candidate.candidate
            })).then(function () {
            }).catch(function (err) {
            });
        };
        WebRTC.prototype.onAnswer = function (event) {
            var pc = this.getPeerConnection(event.sender);
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then(function (p) {
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
                _this.brokerChannel.Invoke("contextSignal", answer, "broker");
            }, function (error) {
            }, {
                mandatory: {
                    "OfferToReceiveAudio": true,
                    "OfferToReceiveVideo": true
                }
            });
        };
        WebRTC.prototype.addLocalStream = function (stream) {
            this.localSteams.push(stream);
            return this;
        };
        ;
        WebRTC.prototype.onConnected = function (p) {
            var pc = this.getPeerConnection(p);
            // todo: fire event
        };
        WebRTC.prototype.onDisconnected = function (p) {
            var pc = this.getPeerConnection(p);
            pc.close();
            this.removePeerConnection(p);
            // todo: fire event
        };
        WebRTC.prototype.remoteStreamlost = function (streamId, peerId) { };
        WebRTC.prototype.removePeerConnection = function (id) {
            var _this = this;
            var connection = this.Peers.filter(function (conn) {
                return conn.id === id;
            })[0];
            connection.streams.forEach(function (stream) {
                _this.remoteStreamlost(stream.id, connection.id);
            });
            var index = this.Peers.indexOf(connection);
            if (index >= 0)
                this.Peers.splice(index, 1);
        };
        WebRTC.prototype.createPeerConnection = function (id) {
            var _this = this;
            var rtcPeerConnection = new RTCPeerConnection({
                iceServers: [{
                        "url": "stun:stun.l.google.com:19302"
                    }]
            });
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
                    _this.brokerChannel.Invoke("contextSignal", msg);
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
        WebRTC.prototype.onRemoteStream = function (stream, connection) { };
        ;
        WebRTC.prototype.getPeerConnection = function (id) {
            var match = this.Peers.filter(function (connection) {
                return connection.id === id;
            });
            if (match.length === 0) {
                var pc = new Connection(id, this.createPeerConnection(id));
                this.Peers.push(pc);
                return pc.rtcPeerConnection;
            }
            return match[0].rtcPeerConnection;
        };
        WebRTC.prototype.createOffer = function (peer) {
            var _this = this;
            var peerConnection = this.createPeerConnection(peer.peerId);
            this.localSteams.forEach(function (stream) {
                peerConnection.addStream(stream);
            });
            peerConnection.createOffer(function (localDescription) {
                peerConnection.setLocalDescription(localDescription, function () {
                    var offer = {
                        sender: _this.localPeerId,
                        recipient: peer.peerId,
                        message: JSON.stringify(localDescription)
                    };
                    _this.brokerChannel.Invoke("contextSignal", offer, "broker");
                }, function (err) {
                });
            }, function (err) {
            }, {
                mandatory: {
                    "OfferToReceiveAudio": true,
                    "OfferToReceiveVideo": true
                }
            });
            return peerConnection;
        };
        WebRTC.prototype.connect = function (peerConnections) {
            var _this = this;
            peerConnections.forEach(function (peer) {
                var pc = new Connection(peer.peerId, _this.createOffer(peer));
                _this.Peers.push(pc);
            });
        };
        return WebRTC;
    }());
    ThorIOClient.WebRTC = WebRTC;
    var Factory = (function () {
        function Factory(url, controllers, params) {
            var _this = this;
            var self = this;
            this.channels = new Array();
            this.ws = new WebSocket(url + this.toQuery(params || {}));
            this.ws.onmessage = function (event) {
                var message = JSON.parse(event.data);
                _this.GetChannel(message.C).Dispatch(message.T, message.D);
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
                _this.OnOpen.apply(_this, _this.channels);
            };
            controllers.forEach(function (alias) {
                self.channels.push(new Channel(alias, self.ws));
            });
        }
        Factory.prototype.toQuery = function (obj) {
            return "?" + Object.keys(obj).map(function (key) { return (encodeURIComponent(key) + "=" +
                encodeURIComponent(obj[key])); }).join("&");
        };
        Factory.prototype.Close = function () {
            this.ws.close();
        };
        ;
        Factory.prototype.GetChannel = function (alias) {
            var channel = this.channels.filter(function (pre) { return (pre.alias === alias); });
            return channel[0];
        };
        ;
        Factory.prototype.RemoveChannel = function () {
            throw "Not yet implemented";
        };
        Factory.prototype.OnOpen = function (event) { };
        ;
        Factory.prototype.OnError = function (error) {
            console.error(error);
        };
        Factory.prototype.OnClose = function (event) {
            console.error(event);
        };
        return Factory;
    }());
    ThorIOClient.Factory = Factory;
    var Message = (function () {
        function Message(topic, object, controller) {
            this.D = object;
            this.T = topic;
            this.C = controller;
        }
        Object.defineProperty(Message.prototype, "T", {
            get: function () {
                return this._T;
            },
            set: function (v) {
                this._T = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "D", {
            get: function () {
                return this._D;
            },
            set: function (v) {
                this._D = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "C", {
            get: function () {
                return this._C;
            },
            set: function (value) {
                this._C = value;
            },
            enumerable: true,
            configurable: true
        });
        ;
        ;
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
    ThorIOClient.Message = Message;
    var Listener = (function () {
        function Listener(topic, fn) {
            this.fn = fn;
            this.topic = topic;
        }
        return Listener;
    }());
    ThorIOClient.Listener = Listener;
    var Channel = (function () {
        function Channel(alias, ws) {
            this.listeners = new Array();
            this.alias = alias;
            this.ws = ws;
            this.IsConnected = false;
        }
        Channel.prototype.Connect = function () {
            this.ws.send(new ThorIOClient.Message("$connect_", {}, this.alias));
            return this;
        };
        ;
        Channel.prototype.Close = function () {
            this.ws.send(new ThorIOClient.Message("$close_", {}, this.alias));
            return this;
        };
        ;
        Channel.prototype.Subscribe = function (t, fn) {
            this.On(t, fn);
            this.ws.send(new ThorIOClient.Message("subscribe", {
                topic: t,
                controller: this.alias
            }, this.alias));
            return this;
        };
        ;
        Channel.prototype.Unsubscribe = function (t) {
            this.ws.send(new ThorIOClient.Message("unsubscribe", {
                topic: t,
                controller: this.alias
            }, this.alias));
            return this;
        };
        ;
        Channel.prototype.On = function (t, fn) {
            this.listeners.push(new ThorIOClient.Listener(t, fn));
            return this;
        };
        ;
        Channel.prototype.findListener = function (t) {
            var listener = this.listeners.filter(function (pre) {
                return pre.topic === t;
            });
            return listener[0];
        };
        Channel.prototype.Off = function (t) {
            var index = this.listeners.indexOf(this.findListener(t));
            if (index >= 0)
                this.listeners.splice(index, 1);
            return this;
        };
        ;
        Channel.prototype.Invoke = function (t, d, c) {
            this.ws.send(new ThorIOClient.Message(t, d, c || this.alias));
            return this;
        };
        ;
        Channel.prototype.SetProperty = function (name, value, controller) {
            this.Invoke(name, value, controller || this.alias);
            return this;
        };
        ;
        Channel.prototype.Dispatch = function (t, d) {
            if (t === "$open_") {
                d = JSON.parse(d);
                this.IsConnected = true;
                this.OnOpen(d);
                return;
            }
            else if (t === "$close_") {
                this.OnClose([JSON.parse(d)]);
                this.IsConnected = false;
            }
            else {
                var listener = this.findListener(t);
                if (listener)
                    listener.fn(JSON.parse(d));
            }
        };
        ;
        Channel.prototype.OnOpen = function (message) { };
        ;
        Channel.prototype.OnClose = function (message) { };
        ;
        return Channel;
    }());
    ThorIOClient.Channel = Channel;
})(ThorIOClient || (ThorIOClient = {}));
//# sourceMappingURL=thor-io.client.js.map