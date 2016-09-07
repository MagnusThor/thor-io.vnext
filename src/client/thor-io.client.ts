
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
    export class PeerConnection {
        context: string;
        peerId: string;
    }
    export class Connection {
        id: string;
        rtcPeerConnection: RTCPeerConnection;
        streams: Array<any>;
        constructor(id: string, rtcPeerConnection: RTCPeerConnection) {
            this.id = id;
            this.rtcPeerConnection = rtcPeerConnection;
            this.streams = new Array<any>();
        }
    }
    export class WebRTC {

        // todo: rename
        public Peers: Array<Connection>;
        public Peer: RTCPeerConnection;

        public localPeerId: string;
        public context: string;
        public localSteams: Array<any>;

        public Errors: Array<any>;

        constructor(private brokerProxy: ThorIO.Client.Proxy, private rtcConfig: RTCConfiguration) {

            this.Errors = new Array<any>();

            this.Peers = new Array<any>();
            this.localSteams = new Array<any>();
            this.signalHandlers();

            brokerProxy.On("contextCreated", (peer:PeerConnection) => {
                this.localPeerId = peer.peerId;
                this.context = peer.context;
                this.onContextCreated(peer);
            });
            brokerProxy.On("contextChanged", (context:string) => {
                this.context = context;
                this.onContextChanged(context);
            });

            brokerProxy.On("connectTo", (peers:Array<PeerConnection>) =>{
                this.onConnectTo(peers);
            });


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
            this.onError(err);
        }
        public onError(err: any) { }

        onContextCreated(peerConnection: PeerConnection) {

        }
        onContextChanged(context: string) { }
        onRemoteStream(stream: MediaStream, connection: Connection) { };
        onRemoteStreamlost(streamId: string, peerId: string) { }

        onLocalSteam(stream: MediaStream) { };
        onContextConnected(rtcPeerConnection: RTCPeerConnection) { }
        onContextDisconnected(rtcPeerConnection: RTCPeerConnection) { }

        onConnectTo(peerConnections: Array<PeerConnection>) {
            this.connect(peerConnections);
        }
        onConnected(peerId: string) {
            this.onContextConnected(this.getPeerConnection(peerId))

        }
        onDisconnected(peerId: string) {
            let pc = this.getPeerConnection(peerId);
            pc.close();
            this.onContextDisconnected(pc);
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
            this.localSteams.forEach((stream) => {
                pc.addStream(stream);

            });
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));
            pc.createAnswer((description) => {
                pc.setLocalDescription(description);
                let answer = {
                    sender: this.localPeerId,
                    recipient: event.sender,
                    message: JSON.stringify(description)
                };
                this.brokerProxy.Invoke("contextSignal", answer);

            }, (err) => {
                this.addError(err);
            }, {
                    mandatory: {
                        "offerToReceiveAudio": true,
                        "offerToReceiveVideo": true
                    }
                });

        }

        addLocalStream(stream: any): WebRTC {
            this.localSteams.push(stream);
            return this;
        }
        addIceServer(iceServer: RTCIceServer): WebRTC {
        this.rtcConfig.iceServers.push(iceServer);
            return this;
        }



        private removePeerConnection(id: string) {
            let connection = this.Peers.filter((conn: Connection) => {
                return conn.id === id;
            })[0];
            connection.streams.forEach((stream: MediaStream) => {
                this.onRemoteStreamlost(stream.id, connection.id)
            });
            let index = this.Peers.indexOf(connection);
            if (index > -1)
                this.Peers.splice(index, 1);
        }

        private createPeerConnection(id: string): RTCPeerConnection {

            let rtcPeerConnection = new RTCPeerConnection(this.rtcConfig);

            rtcPeerConnection.onsignalingstatechange = (state) => { };
            rtcPeerConnection.onicecandidate = (event: any) => {
                if (!event || !event.candidate) return;
                if (event.candidate) {
                    let msg = {
                        sender: this.localPeerId,
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
                        this.onConnected(id);
                        break;
                    case "disconnected":
                        this.onDisconnected(id);
                        break;
                };
            };
            rtcPeerConnection.onaddstream = (event: RTCMediaStreamEvent) => {
                let connection = this.Peers.filter((p) => {
                    return p.id === id;
                })[0];
                connection.streams.push(event.stream);
                this.onRemoteStream(event.stream, connection);
            };
            return rtcPeerConnection;
        }

        private getPeerConnection(id: string): RTCPeerConnection {
            let match = this.Peers.filter((connection: Connection) => {
                return connection.id === id;
            });
            if (match.length === 0) {
                let pc = new Connection(id, this.createPeerConnection(id));
                this.Peers.push(pc);
                return pc.rtcPeerConnection;
            }
            return match[0].rtcPeerConnection;
        }
        private createOffer(peer: PeerConnection) {
            let peerConnection = this.createPeerConnection(peer.peerId);
            this.localSteams.forEach((stream) => {
                peerConnection.addStream(stream);
                this.onLocalSteam(stream);
            });
            peerConnection.createOffer((localDescription: RTCSessionDescription) => {
                peerConnection.setLocalDescription(localDescription, () => {
                    let offer = {
                        sender: this.localPeerId,
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
                        "offerToReceiveVideo": true
                    }
                });
            return peerConnection;
        }

        disconnect() {
            this.Peers.forEach((p: Connection) => {
                p.rtcPeerConnection.close();
            });

            this.changeContext(Math.random().toString(36).substring(2));
        }
        connect(peerConnections: Array<PeerConnection>): WebRTC {
            peerConnections.forEach((peer: PeerConnection) => {
                let pc = new Connection(peer.peerId, this.createOffer(peer));
                this.Peers.push(pc);
            })
            return this;
        }


        changeContext(context: string): WebRTC {
            this.brokerProxy.Invoke("changeContext", { context: context });
            return this;
        }

        connectPeers() {
            this.brokerProxy.Invoke("connectContext", {});
        }
        connectContext() {
            this.connectPeers();
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

                if(listener)
                    listener.fn(JSON.parse(data));

            }
        };
    }



}