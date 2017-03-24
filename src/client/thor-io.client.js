var ThorIOClient;
(function (ThorIOClient) {
    class BinaryMessage {
        constructor(message, arrayBuffer) {
            this.arrayBuffer = arrayBuffer;
            this.header = new Uint8Array(ThorIOClient.Utils.longToArray(message.length));
            this.Buffer = this.joinBuffers(this.joinBuffers(this.header.buffer, ThorIOClient.Utils.stingToBuffer(message).buffer), arrayBuffer);
        }
        static fromArrayBuffer(buffer) {
            const headerLen = 8;
            let header = new Uint8Array(buffer, 0, headerLen);
            let payloadLength = ThorIOClient.Utils.arrayToLong(header);
            let message = new Uint8Array(buffer, headerLen, payloadLength);
            let blobOffset = headerLen + payloadLength;
            let messageBuffer = new Uint8Array(buffer, blobOffset, buffer.byteLength - blobOffset);
            let json = JSON.parse(String.fromCharCode.apply(null, new Uint16Array(message)));
            return new Message(json.T, json.D, json.C, messageBuffer.buffer);
        }
        joinBuffers(a, b) {
            let newBuffer = new Uint8Array(a.byteLength + b.byteLength);
            newBuffer.set(new Uint8Array(a), 0);
            newBuffer.set(new Uint8Array(b), a.byteLength);
            return newBuffer.buffer;
        }
    }
    ThorIOClient.BinaryMessage = BinaryMessage;
    class Message {
        constructor(topic, object, controller, buffer) {
            this.D = object;
            this.T = topic;
            this.C = controller;
            this.B = buffer;
        }
        get JSON() {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            };
        }
        ;
        toString() {
            return JSON.stringify(this.JSON);
        }
        static fromArrayBuffer(buffer) {
            let headerLen = 8;
            let header = new Uint8Array(buffer, 0, headerLen);
            let payloadLength = ThorIOClient.Utils.arrayToLong(header);
            let message = new Uint8Array(buffer, headerLen, payloadLength);
            let blobOffset = headerLen + payloadLength;
            let messageBuffer = new Uint8Array(buffer, blobOffset, buffer.byteLength - blobOffset);
            let json = JSON.parse(String.fromCharCode.apply(null, new Uint16Array(message)));
            return new Message(json.T, json.D, json.C, messageBuffer.buffer);
        }
    }
    ThorIOClient.Message = Message;
    // todo: Move to separate namespace
    class PeerConnection {
    }
    ThorIOClient.PeerConnection = PeerConnection;
    class WebRTCConnection {
        constructor(id, rtcPeerConnection) {
            this.id = id;
            this.rtcPeerConnection = rtcPeerConnection;
            this.streams = new Array();
        }
    }
    ThorIOClient.WebRTCConnection = WebRTCConnection;
    class Recorder {
        constructor(stream, mimeType, ignoreMutedMedia) {
            this.stream = stream;
            this.mimeType = mimeType;
            this.ignoreMutedMedia = ignoreMutedMedia;
            this.recorder = new MediaRecorder(stream, { mimeType: mimeType, ignoreMutedMedia: ignoreMutedMedia });
            this.recorder.onstop = (event) => {
                this.handleStop(event);
            };
            this.recorder.ondataavailable = (event) => {
                this.handleDataAvailable(event);
            };
        }
        handleStop(event) {
            this.IsRecording = false;
            let blob = new Blob(this.blobs, { type: this.mimeType });
            this.OnRecordComplated.apply(event, [blob, URL.createObjectURL(blob)]);
        }
        OnRecordComplated(blob, blobUrl) { }
        handleDataAvailable(event) {
            if (event.data.size > 0) {
                this.blobs.push(event.data);
            }
        }
        IsTypeSupported(type) {
            throw "not yet implemented";
        }
        GetStats() {
            return {
                videoBitsPerSecond: this.recorder.videoBitsPerSecond,
                audioBitsPerSecond: this.recorder.audioBitsPerSecond
            };
        }
        Stop() {
            this.recorder.stop();
        }
        Start(ms) {
            this.blobs = new Array();
            if (this.IsRecording) {
                this.Stop();
                return;
            }
            this.blobs.length = 0;
            this.IsRecording = true;
            this.recorder.start(ms || 100);
        }
    }
    ThorIOClient.Recorder = Recorder;
    class PeerChannel {
        constructor(peerId, dataChannel, label) {
            this.peerId = peerId;
            this.dataChannel = dataChannel;
            this.label = label; // name
        }
    }
    ThorIOClient.PeerChannel = PeerChannel;
    class DataChannel {
        constructor(name, listeners) {
            this.listeners = listeners || new Array();
            this.PeerChannels = new Array();
            this.Name = name;
        }
        On(topic, fn) {
            var listener = new ThorIOClient.Listener(topic, fn);
            this.listeners.push(listener);
            return listener;
        }
        ;
        OnOpen(event, peerId) { }
        ;
        OnClose(event, peerId) { }
        OnMessage(event) {
            var msg = JSON.parse(event.data);
            var listener = this.findListener(msg.T);
            if (listener)
                listener.fn.apply(this, [JSON.parse(msg.D)]);
        }
        Close() {
            this.PeerChannels.forEach((pc) => {
                pc.dataChannel.close();
            });
        }
        findListener(topic) {
            let listener = this.listeners.filter((pre) => {
                return pre.topic === topic;
            });
            return listener[0];
        }
        Off(topic) {
            let index = this.listeners.indexOf(this.findListener(topic));
            if (index >= 0)
                this.listeners.splice(index, 1);
        }
        ;
        Invoke(topic, data, controller) {
            this.PeerChannels.forEach((channel) => {
                if (channel.dataChannel.readyState === "open") {
                    channel.dataChannel.send(new ThorIOClient.Message(topic, data, this.Name).toString());
                }
            });
            return this;
        }
        AddPeerChannel(pc) {
            this.PeerChannels.push(pc);
        }
        RemovePeerChannel(id, dataChannel) {
            let match = this.PeerChannels.filter((p) => {
                return p.peerId === id;
            })[0];
            let index = this.PeerChannels.indexOf(match);
            if (index > -1)
                this.PeerChannels.splice(index, 1);
        }
    }
    ThorIOClient.DataChannel = DataChannel;
    class BandwidthConstraints {
        constructor(videobandwidth, audiobandwidth) {
            this.videobandwidth = videobandwidth;
            this.audiobandwidth = audiobandwidth;
        }
    }
    ThorIOClient.BandwidthConstraints = BandwidthConstraints;
    class WebRTC {
        constructor(brokerProxy, rtcConfig) {
            this.brokerProxy = brokerProxy;
            this.rtcConfig = rtcConfig;
            this.Errors = new Array();
            this.DataChannels = new Array();
            this.Peers = new Array();
            this.LocalSteams = new Array();
            this.signalHandlers();
            brokerProxy.On("contextCreated", (peer) => {
                this.LocalPeerId = peer.peerId;
                this.Context = peer.context;
                this.OnContextCreated(peer);
            });
            brokerProxy.On("contextChanged", (context) => {
                this.Context = context;
                this.OnContextChanged(context);
            });
            brokerProxy.On("connectTo", (peers) => {
                this.OnConnectTo(peers);
            });
        }
        setBandwithConstraints(videobandwidth, audiobandwidth) {
            this.bandwidthConstraints = new BandwidthConstraints(videobandwidth, audiobandwidth);
        }
        setMediaBitrates(sdp) {
            return this.setMediaBitrate(this.setMediaBitrate(sdp, "video", this.bandwidthConstraints.videobandwidth), "audio", this.bandwidthConstraints.audiobandwidth);
        }
        setMediaBitrate(sdp, media, bitrate) {
            let lines = sdp.split("\n");
            let line = -1;
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].indexOf("m=" + media) === 0) {
                    line = i;
                    break;
                }
            }
            if (line === -1) {
                return sdp;
            }
            line++;
            while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
                line++;
            }
            if (lines[line].indexOf("b") === 0) {
                lines[line] = "b=AS:" + bitrate;
                return lines.join("\n");
            }
            var newLines = lines.slice(0, line);
            newLines.push("b=AS:" + bitrate);
            newLines = newLines.concat(lines.slice(line, lines.length));
            return newLines.join("\n");
        }
        CreateDataChannel(name) {
            let channel = new DataChannel(name);
            this.DataChannels.push(channel);
            return channel;
        }
        RemoveDataChannel(name) {
            var match = this.DataChannels.filter((p) => { return p.Name === name; })[0];
            this.DataChannels.splice(this.DataChannels.indexOf(match), 1);
        }
        signalHandlers() {
            this.brokerProxy.On("contextSignal", (signal) => {
                let msg = JSON.parse(signal.message);
                switch (msg.type) {
                    case "offer":
                        this.onOffer(signal);
                        break;
                    case "answer":
                        this.onAnswer(signal);
                        break;
                    case "candidate":
                        this.onCandidate(signal);
                        break;
                    default:
                        // do op
                        break;
                }
            });
        }
        addError(err) {
            this.OnError(err);
        }
        OnConnectTo(peerConnections) {
            this.Connect(peerConnections);
        }
        OnConnected(peerId) {
            this.OnContextConnected(this.getPeerConnection(peerId));
        }
        OnDisconnected(peerId) {
            let peerConnection = this.getPeerConnection(peerId);
            peerConnection.close();
            this.OnContextDisconnected(peerConnection);
            this.removePeerConnection(peerId);
        }
        onCandidate(event) {
            let msg = JSON.parse(event.message);
            let candidate = msg.iceCandidate;
            let pc = this.getPeerConnection(event.sender);
            pc.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.label,
                candidate: candidate.candidate
            })).then(() => {
            }).catch((err) => {
                this.addError(err);
            });
        }
        onAnswer(event) {
            let pc = this.getPeerConnection(event.sender);
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then((p) => {
            }).catch((err) => {
                this.addError(err);
            });
        }
        onOffer(event) {
            let pc = this.getPeerConnection(event.sender);
            this.LocalSteams.forEach((stream) => {
                pc.addStream(stream);
            });
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));
            pc.createAnswer((description) => {
                pc.setLocalDescription(description);
                if (this.bandwidthConstraints)
                    description.sdp = this.setMediaBitrates(description.sdp);
                let answer = {
                    sender: this.LocalPeerId,
                    recipient: event.sender,
                    message: JSON.stringify(description)
                };
                this.brokerProxy.Invoke("contextSignal", answer);
            }, (err) => {
                this.addError(err);
            }, {
                mandatory: {
                    "offerToReceiveAudio": true,
                    "offerToReceiveVideo": true,
                }
            });
        }
        AddLocalStream(stream) {
            this.LocalSteams.push(stream);
            return this;
        }
        AddIceServer(iceServer) {
            this.rtcConfig.iceServers.push(iceServer);
            return this;
        }
        removePeerConnection(id) {
            let connection = this.Peers.filter((conn) => {
                return conn.id === id;
            })[0];
            connection.streams.forEach((stream) => {
                this.OnRemoteStreamlost(stream.id, connection.id);
            });
            let index = this.Peers.indexOf(connection);
            if (index > -1)
                this.Peers.splice(index, 1);
        }
        createPeerConnection(id) {
            let rtcPeerConnection = new RTCPeerConnection(this.rtcConfig);
            rtcPeerConnection.onsignalingstatechange = (state) => { };
            rtcPeerConnection.onicecandidate = (event) => {
                if (!event || !event.candidate)
                    return;
                if (event.candidate) {
                    let msg = {
                        sender: this.LocalPeerId,
                        recipient: id,
                        message: JSON.stringify({
                            type: 'candidate',
                            iceCandidate: event.candidate
                        })
                    };
                    this.brokerProxy.Invoke("contextSignal", msg);
                }
            };
            rtcPeerConnection.oniceconnectionstatechange = (event) => {
                switch (event.target.iceConnectionState) {
                    case "connected":
                        this.OnConnected(id);
                        break;
                    case "disconnected":
                        this.OnDisconnected(id);
                        break;
                }
                ;
            };
            rtcPeerConnection.onaddstream = (event) => {
                let connection = this.Peers.filter((p) => {
                    return p.id === id;
                })[0];
                connection.streams.push(event.stream);
                this.OnRemoteStream(event.stream, connection);
            };
            this.DataChannels.forEach((dataChannel) => {
                let pc = new PeerChannel(id, rtcPeerConnection.createDataChannel(dataChannel.Name), dataChannel.Name);
                dataChannel.AddPeerChannel(pc);
                rtcPeerConnection.ondatachannel = (event) => {
                    let channel = event.channel;
                    channel.onopen = (event) => {
                        dataChannel.OnOpen(event, id);
                    };
                    channel.onclose = (event) => {
                        dataChannel.RemovePeerChannel(id, event.target);
                        dataChannel.OnClose(event, id);
                    };
                    channel.onmessage = (message) => {
                        dataChannel.OnMessage(message);
                    };
                };
            });
            return rtcPeerConnection;
        }
        findPeerConnection(pre) {
            throw "Not implemented";
        }
        getPeerConnection(id) {
            let match = this.Peers.filter((connection) => {
                return connection.id === id;
            });
            if (match.length === 0) {
                let pc = new WebRTCConnection(id, this.createPeerConnection(id));
                this.Peers.push(pc);
                return pc.rtcPeerConnection;
            }
            return match[0].rtcPeerConnection;
        }
        createOffer(peer) {
            let peerConnection = this.createPeerConnection(peer.peerId);
            this.LocalSteams.forEach((stream) => {
                peerConnection.addStream(stream);
                this.OnLocalSteam(stream);
            });
            peerConnection.createOffer((description) => {
                peerConnection.setLocalDescription(description, () => {
                    if (this.bandwidthConstraints)
                        description.sdp = this.setMediaBitrates(description.sdp);
                    let offer = {
                        sender: this.LocalPeerId,
                        recipient: peer.peerId,
                        message: JSON.stringify(description)
                    };
                    this.brokerProxy.Invoke("contextSignal", offer);
                }, (err) => {
                    this.addError(err);
                });
            }, (err) => {
                this.addError(err);
            }, {
                mandatory: {
                    "offerToReceiveAudio": true,
                    "offerToReceiveVideo": true,
                }
            });
            return peerConnection;
        }
        Disconnect() {
            this.Peers.forEach((connection) => {
                connection.rtcPeerConnection.close();
            });
            this.ChangeContext(Math.random().toString(36).substring(2));
        }
        Connect(peerConnections) {
            peerConnections.forEach((peerConnection) => {
                let pc = new WebRTCConnection(peerConnection.peerId, this.createOffer(peerConnection));
                this.Peers.push(pc);
            });
            return this;
        }
        ChangeContext(context) {
            this.brokerProxy.Invoke("changeContext", { context: context });
            return this;
        }
        ConnectPeers() {
            this.brokerProxy.Invoke("connectContext", {});
        }
        ConnectContext() {
            this.ConnectPeers();
        }
    }
    ThorIOClient.WebRTC = WebRTC;
    class Factory {
        constructor(url, controllers, params) {
            this.url = url;
            this.proxys = new Array();
            this.ws = new WebSocket(url + this.toQuery(params || {}));
            this.ws.binaryType = "arraybuffer";
            controllers.forEach(alias => {
                this.proxys.push(new Proxy(alias, this.ws));
            });
            this.ws.onmessage = event => {
                if (typeof (event.data) !== "object") {
                    let message = JSON.parse(event.data);
                    this.GetProxy(message.C).Dispatch(message.T, message.D);
                }
                else {
                    let message = ThorIOClient.Message.fromArrayBuffer(event.data);
                    this.GetProxy(message.C).Dispatch(message.T, message.D, message.B);
                }
            };
            this.ws.onclose = event => {
                this.IsConnected = false;
                this.OnClose.apply(this, [event]);
            };
            this.ws.onerror = error => {
                this.OnError.apply(this, [error]);
            };
            this.ws.onopen = event => {
                this.IsConnected = true;
                this.OnOpen.apply(this, this.proxys);
            };
        }
        toQuery(obj) {
            return `?${Object.keys(obj).map(key => (encodeURIComponent(key) + "=" +
                encodeURIComponent(obj[key]))).join("&")}`;
        }
        Close() {
            this.ws.close();
        }
        ;
        GetProxy(alias) {
            let channel = this.proxys.filter(pre => (pre.alias === alias));
            return channel[0];
        }
        ;
        RemoveProxy(alias) {
            var index = this.proxys.indexOf(this.GetProxy(alias));
            this.proxys.splice(index, 1);
        }
        OnOpen(proxys) { }
        ;
        OnError(error) { }
        OnClose(event) { }
    }
    ThorIOClient.Factory = Factory;
    class Listener {
        constructor(topic, fn) {
            this.fn = fn;
            this.topic = topic;
            this.count = 0;
        }
    }
    ThorIOClient.Listener = Listener;
    class Utils {
        static stingToBuffer(str) {
            let len = str.length;
            var arr = new Array(len);
            for (let i = 0; i < len; i++) {
                arr[i] = str.charCodeAt(i) & 0xFF;
            }
            return new Uint8Array(arr);
        }
        static arrayToLong(byteArray) {
            var value = 0;
            let byteLength = byteArray.byteLength;
            for (let i = byteLength - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i];
            }
            return value;
        }
        static longToArray(long) {
            var byteArray = new Uint8Array(8);
            let byteLength = byteArray.length;
            for (let index = 0; index < byteLength; index++) {
                let byte = long & 0xff;
                byteArray[index] = byte;
                long = (long - byte) / 256;
            }
            return byteArray;
        }
        static newGuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            ;
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }
    }
    ThorIOClient.Utils = Utils;
    class PropertyMessage {
        constructor() {
            this.messageId = ThorIOClient.Utils.newGuid();
        }
    }
    ThorIOClient.PropertyMessage = PropertyMessage;
    class Proxy {
        constructor(alias, ws) {
            this.alias = alias;
            this.ws = ws;
            this.listeners = new Array();
            this.IsConnected = false;
            this.On("___error", (err) => {
                this.OnError(err);
            });
        }
        OnError(event) { }
        OnOpen(event) { }
        OnClose(event) { }
        Connect() {
            this.ws.send(new ThorIOClient.Message("___connect", {}, this.alias));
            return this;
        }
        ;
        Close() {
            this.ws.send(new ThorIOClient.Message("___close", {}, this.alias));
            return this;
        }
        ;
        Subscribe(topic, callback) {
            this.ws.send(new ThorIOClient.Message("___subscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));
            return this.On(topic, callback);
        }
        ;
        Unsubscribe(topic) {
            this.ws.send(new ThorIOClient.Message("___unsubscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));
        }
        ;
        On(topic, fn) {
            var listener = new ThorIOClient.Listener(topic, fn);
            this.listeners.push(listener);
            return listener;
        }
        ;
        findListener(topic) {
            let listener = this.listeners.filter((pre) => {
                return pre.topic === topic;
            });
            return listener[0];
        }
        Off(topic) {
            let index = this.listeners.indexOf(this.findListener(topic));
            if (index >= 0)
                this.listeners.splice(index, 1);
        }
        ;
        InvokeBinary(buffer) {
            if (buffer instanceof ArrayBuffer) {
                this.ws.send(buffer);
                return this;
            }
            else {
                throw ("parameter provided must be an ArrayBuffer constructed by Client.BinaryMessage");
            }
        }
        PublishBinary(buffer) {
            if (buffer instanceof ArrayBuffer) {
                this.ws.send(buffer);
                return this;
            }
            else {
                throw ("parameter provided must be an ArrayBuffer constructed by Client.BinaryMessage");
            }
        }
        Invoke(topic, data, controller) {
            this.ws.send(new ThorIOClient.Message(topic, data, controller || this.alias));
            return this;
        }
        ;
        Publish(topic, data, controller) {
            this.ws.send(new ThorIOClient.Message(topic, data, controller || this.alias));
            return this;
        }
        ;
        SetProperty(propName, propValue, controller) {
            this.Invoke(propName, propValue, controller || this.alias);
            return this;
        }
        ;
        Dispatch(topic, data, buffer) {
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
                let listener = this.findListener(topic);
                if (listener)
                    listener.fn(JSON.parse(data), buffer);
            }
        }
        ;
    }
    ThorIOClient.Proxy = Proxy;
})(ThorIOClient || (ThorIOClient = {}));
//# sourceMappingURL=thor-io.client.js.map