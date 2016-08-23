namespace ThorIOClient {

    export class Message {

        T: string;
        D: any;
        C: string;
        id: string;
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
            this.id = id || ThorIOClient.Utils.newGuid();
        }
        toString() {
            return JSON.stringify(this.JSON);
        }
    }


    export class PeerConnection {
        public context: string;
        public peerId: string;
    }

    export class Connection {
        public id: string;
        public rtcPeerConnection: webkitRTCPeerConnection;
        public streams: Array<any>;
        constructor(id: string, rtcPeerConnection: RTCPeerConnection) {
            this.id = id;
            this.rtcPeerConnection = rtcPeerConnection;
            this.streams = new Array<any>();
        }
    }
    export class WebRTC {
        public Peers: Array<Connection>;
        public Peer: RTCPeerConnection;
        public localPeerId: string;
        public localSteams: Array<any>;

        constructor(private brokerChannel: ThorIOClient.Channel, private rtcConfig: RTCConfiguration) {

            this.Peers = new Array<any>();
            this.localSteams = new Array<any>();

            brokerChannel.On("contextSignal", (signal: any) => {
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
                }

            });

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
            });
        }
        private onAnswer(event) {
            let pc = this.getPeerConnection(event.sender);
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then((p) => {
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
                this.brokerChannel.Invoke("contextSignal", answer, "broker");

            }, (error) => {

            }, {
                    mandatory: {
                        "offerToReceiveAudio": true,
                        "offerToReceiveVideo": true
                    }
                });

        }

        addLocalStream(stream: any) {
            this.localSteams.push(stream);
            return this;
        };

        private onConnected(p: any) {
            let pc = this.getPeerConnection(p);
            // todo: fire event
        }

        private onDisconnected(p: any) {
            let pc = this.getPeerConnection(p);
            pc.close();
            this.removePeerConnection(p);
            // todo: fire event
        }

        remoteStreamlost(streamId: string, peerId: string) { }

        private removePeerConnection(id: string) {
            let connection = this.Peers.filter((conn: Connection) => {
                return conn.id === id;
            })[0];
            connection.streams.forEach((stream: MediaStream) => {
                this.remoteStreamlost(stream.id, connection.id)
            });
            let index = this.Peers.indexOf(connection);
            if (index >= 0)
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
                    this.brokerChannel.Invoke("contextSignal", msg);
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
        public onRemoteStream(stream: MediaStream, connection: Connection) { };
        private getPeerConnection(id: string): webkitRTCPeerConnection {
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
            });

            peerConnection.createOffer((localDescription: RTCSessionDescription) => {

                peerConnection.setLocalDescription(localDescription, () => {
                    let offer = {
                        sender: this.localPeerId,
                        recipient: peer.peerId,
                        message: JSON.stringify(localDescription)
                    };
                    this.brokerChannel.Invoke("contextSignal",
                        offer, "broker"
                    );

                }, function (err) {

                });
            }, (err) => {

            }, {
                    mandatory: {
                        "offerToReceiveAudio": true,
                        "offerToReceiveVideo": true
                    }
                });
            return peerConnection;
        }
        connect(peerConnections: Array<PeerConnection>) {
            peerConnections.forEach((peer: PeerConnection) => {
                let pc = new Connection(peer.peerId, this.createOffer(peer));
                this.Peers.push(pc);
            });
        }
    }

    export class Factory {
        private ws: WebSocket;
        private toQuery(obj: any) {
            return `?${Object.keys(obj).map(key => (encodeURIComponent(key) + "=" +
                encodeURIComponent(obj[key]))).join("&")}`;
        }
        private channels: Array<ThorIOClient.Channel>;
        public IsConnected: boolean;
        constructor(private url: string, controllers: Array<string>, params?: any) {
            let self = this;
            this.channels = new Array<ThorIOClient.Channel>();
            this.ws = new WebSocket(url + this.toQuery(params || {}));
            this.ws.onmessage = event => {
                let message = JSON.parse(event.data);

                this.GetChannel(message.C).Dispatch(message.T, message.D);
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
                this.OnOpen.apply(this, this.channels);
            };
            controllers.forEach(alias => {
                self.channels.push(
                    new Channel(alias, self.ws)
                );
            });
        }
        Close() {
            this.ws.close();
        };
        GetChannel(alias: string): ThorIOClient.Channel {
            let channel = this.channels.filter(pre => (pre.alias === alias));
            return channel[0];
        };
        RemoveChannel() {
            throw "Not yet implemented";
        }
        OnOpen(event: any) { };
        OnError(error: any) {
            console.error(error);
        }
        OnClose(event: any) {
            console.error(event);
        }

    }

    export class Listener {
        fn: Function;
        topic: string;
        constructor(topic: string, fn: Function) {
            this.fn = fn;
            this.topic = topic;
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
            this.messageId = ThorIOClient.Utils.newGuid();
        }
    }

    export class Channel {
        IsConnected: boolean;
        listeners: Array<ThorIOClient.Listener>;
        promisedMessages: Array<PromisedMessage>;
        constructor(public alias: string, private ws: WebSocket) {
            this.promisedMessages = new Array<PromisedMessage>();
            this.listeners = new Array<ThorIOClient.Listener>();
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
        Connect() {
            this.ws.send(new ThorIOClient.Message("___connect", {}, this.alias));
            return this;
        };
        Close() {
            this.ws.send(new ThorIOClient.Message("___close", {}, this.alias));
            return this;
        };
        Subscribe(topic: string, callback: any) {
            this.On(topic, callback);
            this.ws.send(new ThorIOClient.Message("___subscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));
            return this;
        };
        Unsubscribe(topic: string) {
            this.ws.send(new ThorIOClient.Message("___unsubscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));
            return this;
        };
        On(topic: string, fn: any) {
            this.listeners.push(new ThorIOClient.Listener(topic, fn));
            return this;
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
            return this;
        };
        Invoke(topic: string, d: any, c?: string) {
            this.ws.send(new ThorIOClient.Message(topic, d, c || this.alias));
            return this;
        };
        SetProperty(propName: string, propValue: any, controller?: string) {
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
        Dispatch(topic: string, data: any) {
            if (topic === "___open") {
                data = JSON.parse(data);
                this.IsConnected = true;
                this.OnOpen(data);
                return;
            } else if (topic === "___close") {
                this.OnClose([JSON.parse(data)]);
                this.IsConnected = false;
            } else {
                let listener = this.findListener(topic);
                if (listener) listener.fn(JSON.parse(data));
            }
        };
        OnOpen(event: any) { };
        OnClose(event: any) { };
    }



}