
declare var MediaRecorder: any;
namespace ThorIO.Client {
    export class Message {
        T: string;
        D: any;
        C: string;
        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        constructor(topic: string, object: any, controller: string, id?: string) {
            this.D = object;
            this.T = topic;
            this.C = controller;
        }
        toString() {
            return JSON.stringify(this.JSON);
        }
    }
    // todo: Move to separate namespace
    export class PeerConnection {
        context: string;
        peerId: string;
    }

    export class WebRTCConnection {
        id: string;
        rtcPeerConnection: RTCPeerConnection;
        streams: Array<any>;
        constructor(id: string, rtcPeerConnection: RTCPeerConnection) {
            this.id = id;
            this.rtcPeerConnection = rtcPeerConnection;
            this.streams = new Array<any>();
        }
    }



    export class Recorder {
        private recorder: MediaRecorder;
        private blobs: Array<any>;
        public IsRecording: boolean;
        constructor(private stream: MediaStream, private mimeType: string, private ignoreMutedMedia) {
            this.recorder = new MediaRecorder(stream,
                { mimeType: mimeType, ignoreMutedMedia: ignoreMutedMedia }
            );
            this.recorder.onstop = (event) => {
                this.handleStop(event);
            }
            this.recorder.ondataavailable = (event) => {
                this.handleDataAvailable(event)
            };
        }

        private handleStop(event: any) {
            this.IsRecording = false;
            let blob = new Blob(this.blobs, { type: this.mimeType });
            this.OnRecordComplated.apply(event, [blob, URL.createObjectURL(blob)]);
        }

        public OnRecordComplated(blob: any, blobUrl: string) { }

        private handleDataAvailable(event: any) {
            if (event.data.size > 0) {
                this.blobs.push(event.data);
            
            }
        }
      
        IsTypeSupported(type:string){
                throw "not yet implemented";
        }
        GetStats():any{
            return {
                videoBitsPerSecond: this.recorder.videoBitsPerSecond,
                audioBitsPerSecond: this.recorder.audioBitsPerSecond
            }
        }
        Stop() {
            this.recorder.stop();
        }
        Start(ms: number) {
            this.blobs = new Array<any>();
            if (this.IsRecording) {
                this.Stop();
                return;
            }
            this.blobs.length = 0;
            this.IsRecording = true;

            this.recorder.start(ms || 100);
        }
    }

    export class PeerChannel {
        dataChannel: RTCDataChannel
        peerId: string;
        label:string;
        constructor(peerId,dataChannel,label){
            this.peerId = peerId;
            this.dataChannel = dataChannel;
            this.label = label; // name
        }

    }

    export class DataChannel {
        private listeners: Array<Listener>;

        public Name: string;
        public PeerChannels: Array<PeerChannel>;

        constructor(name: string, listeners?: Array<Listener>) {
            this.listeners = listeners || new Array<Listener>();
            this.PeerChannels = new Array<PeerChannel>();
            this.Name = name;
        }
        On(topic: string, fn: any): Listener {
            var listener = new ThorIO.Client.Listener(topic, fn);
            this.listeners.push(listener);
            return listener;
        };
        OnOpen(event: Event,peerId:string) { };
        OnClose(event: Event,peerId:string) { }
        OnMessage(event: MessageEvent) {
            var msg = JSON.parse(event.data)
            var listener = this.findListener(msg.T);
            if (listener)
                listener.fn.apply(this, [JSON.parse(msg.D)  ]);
        }
        Close() {
            this.PeerChannels.forEach((pc: PeerChannel) => {
                pc.dataChannel.close();
            });
        }
        private findListener(topic: string): Listener {
            let listener = this.listeners.filter(
                (pre: Listener) => {
                    return pre.topic === topic;
                }
            );
            return listener[0];
        }
        Off(topic: string) {
            let index =
                this.listeners.indexOf(this.findListener(topic));
            if (index >= 0) this.listeners.splice(index, 1);
        };
        Invoke(topic: string, data: any, controller?: string): ThorIO.Client.DataChannel {
            this.PeerChannels.forEach((channel: PeerChannel) => {
                if(channel.dataChannel.readyState === "open"){
                    channel.dataChannel.send(new ThorIO.Client.Message(topic, data, this.Name).toString())
                }
            });
            return this;
        }
        AddPeerChannel(pc:PeerChannel){
            this.PeerChannels.push(pc);
        }

        RemovePeerChannel(id,dataChannel){
            let match = this.PeerChannels.filter( (p:PeerChannel) => {
                            return p.peerId === id ;
                        })[0];
            let index = this.PeerChannels.indexOf(match);
            if(index> -1) this.PeerChannels.splice(index,1);
        }
    }

    export class WebRTC {

        public Peers: Array<WebRTCConnection>;
        public Peer: RTCPeerConnection;
        public DataChannels: Array<DataChannel>;
        public LocalPeerId: string;
        public Context: string;
        public LocalSteams: Array<any>;
        public Errors: Array<any>;

        constructor(private brokerProxy: ThorIO.Client.Proxy, private rtcConfig: RTCConfiguration) {
            this.Errors = new Array<any>();
            this.DataChannels = new Array<DataChannel>();
            this.Peers = new Array<any>();
            this.LocalSteams = new Array<any>();
            this.signalHandlers();

            brokerProxy.On("contextCreated", (peer: PeerConnection) => {
                this.LocalPeerId = peer.peerId;
                this.Context = peer.context;
                this.OnContextCreated(peer);
            });
            brokerProxy.On("contextChanged", (context: string) => {
                this.Context = context;
                this.OnContextChanged(context);
            });

            brokerProxy.On("connectTo", (peers: Array<PeerConnection>) => {
                this.OnConnectTo(peers);
            });
        }


        CreateDataChannel(name: string): ThorIO.Client.DataChannel {
            let channel = new DataChannel(name);

            this.DataChannels.push(channel);

            return channel;
        }
        RemoveDataChannel(name: string) {
            var match = this.DataChannels.filter(
                (p: DataChannel) => { return p.Name === name }
            )[0];
            this.DataChannels.splice(this.DataChannels.indexOf(match), 1);
        }
        private signalHandlers() {
            this.brokerProxy.On("contextSignal", (signal: any) => {
                let msg = JSON.parse(signal.message);
                switch (msg.type) {
                    case "offer":
                        this.onOffer(signal)
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
        private addError(err: any) {
            this.OnError(err);
        }
        public OnError(err: any) { }
        OnContextCreated(peerConnection: PeerConnection) { }
        OnContextChanged(context: string) { }
        OnRemoteStream(stream: MediaStream, connection: WebRTCConnection) { };
        OnRemoteStreamlost(streamId: string, peerId: string) { }

        OnLocalSteam(stream: MediaStream) { };
        OnContextConnected(rtcPeerConnection: RTCPeerConnection) { }
        OnContextDisconnected(rtcPeerConnection: RTCPeerConnection) { }

        OnConnectTo(peerConnections: Array<PeerConnection>) {
            this.Connect(peerConnections);
        }
        OnConnected(peerId: string) {
            this.OnContextConnected(this.getPeerConnection(peerId))

        }
        OnDisconnected(peerId: string) {
            let pc = this.getPeerConnection(peerId);
            pc.close();
            this.OnContextDisconnected(pc);
            this.removePeerConnection(peerId);

        }

        private onCandidate(event) {
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
        private onAnswer(event) {
            let pc = this.getPeerConnection(event.sender);
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then((p) => {
            }).catch((err) => {
                this.addError(err);
            });
        }

        private onOffer(event) {
            let pc = this.getPeerConnection(event.sender);
            this.LocalSteams.forEach((stream) => {
                pc.addStream(stream);

            });
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));
            pc.createAnswer((description) => {
                pc.setLocalDescription(description);
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
        AddLocalStream(stream: any): WebRTC {
            this.LocalSteams.push(stream);
            return this;
        }
        AddIceServer(iceServer: RTCIceServer): WebRTC {
            this.rtcConfig.iceServers.push(iceServer);
            return this;
        }
        private removePeerConnection(id: string) {
            let connection = this.Peers.filter((conn: WebRTCConnection) => {
                return conn.id === id;
            })[0];
            connection.streams.forEach((stream: MediaStream) => {
                this.OnRemoteStreamlost(stream.id, connection.id)
            });
            let index = this.Peers.indexOf(connection);
            if (index > -1)
                this.Peers.splice(index, 1);
        }
        private createPeerConnection(id: string): RTCPeerConnection {
            let rtcPeerConnection = new RTCPeerConnection(this.rtcConfig)
            rtcPeerConnection.onsignalingstatechange = (state) => { };
            rtcPeerConnection.onicecandidate = (event: any) => {
                if (!event || !event.candidate) return;
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
            rtcPeerConnection.oniceconnectionstatechange = (event: any) => {
                switch (event.target.iceConnectionState) {
                    case "connected":
                        this.OnConnected(id);
                        break;
                    case "disconnected":
                        this.OnDisconnected(id);
                        break;
                };
            };
            rtcPeerConnection.onaddstream = (event: RTCMediaStreamEvent) => {
                let connection = this.Peers.filter((p) => {
                    return p.id === id;
                })[0];
                connection.streams.push(event.stream);
                this.OnRemoteStream(event.stream, connection);
            };
            this.DataChannels.forEach((dc: DataChannel) => {
                let pc = new PeerChannel(id,rtcPeerConnection.createDataChannel(dc.Name),dc.Name);
                dc.AddPeerChannel(pc);
                rtcPeerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
                    let channel = event.channel;
                    channel.onopen = (event: Event) => {
                        dc.OnOpen(event,id);
                    };
                    channel.onclose = (event: any) => {
                      dc.RemovePeerChannel(id,event.target);
                      dc.OnClose(event,id);
                  };
                    channel.onmessage = (message: MessageEvent) => {
                        dc.OnMessage(message);
                    };
                }
            });
            return rtcPeerConnection;
        }
      
        private getPeerConnection(id: string): RTCPeerConnection {
            let match = this.Peers.filter((connection: WebRTCConnection) => {
                return connection.id === id;
            });
            if (match.length === 0) {
                let pc = new WebRTCConnection(id, this.createPeerConnection(id));
                this.Peers.push(pc);
                return pc.rtcPeerConnection;
            }
            return match[0].rtcPeerConnection;
        }
        private createOffer(peer: PeerConnection) {
            let peerConnection = this.createPeerConnection(peer.peerId);
            this.LocalSteams.forEach((stream) => {
                peerConnection.addStream(stream);
                this.OnLocalSteam(stream);
            });
            peerConnection.createOffer((localDescription: RTCSessionDescription) => {
                peerConnection.setLocalDescription(localDescription, () => {
                    let offer = {
                        sender: this.LocalPeerId,
                        recipient: peer.peerId,
                        message: JSON.stringify(localDescription)
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
            this.Peers.forEach((p: WebRTCConnection) => {
                p.rtcPeerConnection.close();
            });

            this.ChangeContext(Math.random().toString(36).substring(2));
        }
        Connect(peerConnections: Array<PeerConnection>): WebRTC {
            peerConnections.forEach((peer: PeerConnection) => {
                let pc = new WebRTCConnection(peer.peerId, this.createOffer(peer));
                this.Peers.push(pc);
            })
            return this;
        }

        ChangeContext(context: string): WebRTC {
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

    export class Factory {
        private ws: WebSocket;
        private toQuery(obj: any) {
            return `?${Object.keys(obj).map(key => (encodeURIComponent(key) + "=" +
                encodeURIComponent(obj[key]))).join("&")}`;
        }
        private proxys: Array<ThorIO.Client.Proxy>;
        public IsConnected: boolean;
        constructor(private url: string, controllers: Array<string>, params?: any) {

            this.proxys = new Array<ThorIO.Client.Proxy>();
            this.ws = new WebSocket(url + this.toQuery(params || {}));
            controllers.forEach(alias => {
                this.proxys.push(
                    new Proxy(alias, this.ws)
                );
            });
            this.ws.onmessage = event => {
                let message = JSON.parse(event.data);
                this.GetProxy(message.C).Dispatch(message.T, message.D);
            };
            this.ws.onclose = event => {
                this.IsConnected = false;
                this.OnClose.apply(this, [event]);
            }
            this.ws.onerror = error => {
                this.OnError.apply(this, [error]);
            }
            this.ws.onopen = event => {
                this.IsConnected = true;
                this.OnOpen.apply(this, this.proxys);
            };

        }
        Close() {
            this.ws.close();
        };

        GetProxy(alias: string): ThorIO.Client.Proxy {
            let channel = this.proxys.filter(pre => (pre.alias === alias));
            return channel[0];
        };
        RemoveProxy(alias: string) {
            var index = this.proxys.indexOf(this.GetProxy(alias));
            this.proxys.splice(index, 1);

        }
        OnOpen(proxys: any) { };
        OnError(error: any) { }
        OnClose(event: any) { }

    }

    export class Listener {
        fn: Function;
        topic: string;
        count: number;
        constructor(topic: string, fn: Function) {
            this.fn = fn;
            this.topic = topic;
            this.count = 0;
        }
    }


    export class Utils {
        static newGuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
        }

    }

    export class PromisedMessage {
        resolve: Function;
        messageId: string;
        constructor(id: string, resolve: Function) {
            this.messageId = id;
            this.resolve = resolve;

        }
    }

    export class PropertyMessage {
        name: string;
        value: any;
        messageId: string
        constructor() {
            this.messageId = ThorIO.Client.Utils.newGuid();
        }
    }

    export class Proxy {
        IsConnected: boolean;
        private promisedMessages: Array<PromisedMessage>;
        private listeners: Array<ThorIO.Client.Listener>;

        constructor(public alias: string, private ws: WebSocket) {
            this.promisedMessages = new Array<PromisedMessage>();
            this.listeners = new Array<ThorIO.Client.Listener>();
            this.IsConnected = false;
            this.On("___getProperty", (data: PropertyMessage) => {
                let prom = this.promisedMessages.filter((pre: PromisedMessage) => {
                    return pre.messageId === data.messageId;
                })[0];
                prom.resolve(data.value);

                let index = this.promisedMessages.indexOf(prom);
                this.promisedMessages.splice(index, 1);
            });
        }

        OnOpen(event: any) { };
        OnClose(event: any) { };

        Connect() {
            this.ws.send(new ThorIO.Client.Message("___connect", {}, this.alias));
            return this;
        };

        Close() {
            this.ws.send(new ThorIO.Client.Message("___close", {}, this.alias));
            return this;
        };

        Subscribe(topic: string, callback: any): Listener {

            this.ws.send(new ThorIO.Client.Message("___subscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));
            return this.On(topic, callback);
        };

        Unsubscribe(topic: string) {
            this.ws.send(new ThorIO.Client.Message("___unsubscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));

        };

        On(topic: string, fn: any): Listener {
            var listener = new ThorIO.Client.Listener(topic, fn);
            this.listeners.push(listener);
            return listener;
        };

        private findListener(topic: string): Listener {
            let listener = this.listeners.filter(
                (pre: Listener) => {
                    return pre.topic === topic;
                }
            );
            return listener[0];
        }
        Off(topic: string) {
            let index =
                this.listeners.indexOf(this.findListener(topic));
            if (index >= 0) this.listeners.splice(index, 1);

        };
        Invoke(topic: string, data: any, controller?: string): ThorIO.Client.Proxy {
            this.ws.send(new ThorIO.Client.Message(topic, data, controller || this.alias));
            return this;
        };
        SetProperty(propName: string, propValue: any, controller?: string): ThorIO.Client.Proxy {
            this.Invoke(propName, propValue, controller || this.alias);
            return this;
        };
        GetProperty(propName: string, controller?: string): Promise<any> {
            let propInfo = new PropertyMessage();
            propInfo.name = propName;
            let wrapper = new PromisedMessage(propInfo.messageId, () => { });;
            this.promisedMessages.push(wrapper);
            let promise = new Promise((resolve, reject) => {
                wrapper.resolve = resolve;
            });
            this.Invoke("___getProperty", propInfo, controller || this.alias);
            return promise;
        }
        public Dispatch(topic: string, data: any) {
            if (topic === "___open") {
                this.IsConnected = true;
                this.OnOpen(JSON.parse(data));
                return;
            } else if (topic === "___close") {
                this.OnClose([JSON.parse(data)]);
                this.IsConnected = false;
            } else {
                let listener = this.findListener(topic);

                if (listener)
                    listener.fn(JSON.parse(data));

            }
        };
    }



}