


 namespace ThorIOClient {

    class PeerConnection {
        context: string;
        peerId: string;
    }
    class Connection {
        id: string;
        rtcPeerConnection: webkitRTCPeerConnection;
        streams: Array < any > ;
        constructor(id:string,rtcPeerConnection:RTCPeerConnection) {
            this.id = id;
            this.rtcPeerConnection =rtcPeerConnection;
            this.streams = new Array < any > ();
        }
    }
    export class WebRTC {

        public Peers: Array < Connection > ;
        public Peer: RTCPeerConnection;
        public localPeerId: string;
        public localSteams: Array < any > ;

    

        constructor(private brokerChannel: ThorIOClient.Channel,private rtcConfig:RTCConfiguration) {
            this.Peers = new Array < any > ();
            this.localSteams = new Array < any > ();

            brokerChannel.On("contextSignal", (signal: any) => {
                var msg = JSON.parse(signal.message);
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
            var msg = JSON.parse(event.message);
            var candidate = msg.iceCandidate;
            var pc = this.getPeerConnection(event.sender);

            pc.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.label,
                candidate: candidate.candidate
            })).then(() => {
            }).catch((err) => {
            });
        }
        private onAnswer(event) {
            var pc = this.getPeerConnection(event.sender);
            pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message))).then((p) => {
            });
        }
        
        private onOffer(event) {
            var pc = this.getPeerConnection(event.sender);
            this.localSteams.forEach((stream) => {
                pc.addStream(stream);
            });
          pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.message)));
            pc.createAnswer((description) => {
                pc.setLocalDescription(description);
                var answer = {
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
            var pc = this.getPeerConnection(p);
            // todo: fire event
        }

        private onDisconnected(p: any) {
            var pc = this.getPeerConnection(p);
            pc.close();
            this.removePeerConnection(p);
            // todo: fire event
        }

        remoteStreamlost(streamId:string,peerId:string){}

        private removePeerConnection(id: string) {
            var connection = this.Peers.filter((conn: Connection) => {
                return conn.id === id;
            })[0];
            connection.streams.forEach( (stream:MediaStream) => {
                    this.remoteStreamlost(stream.id,connection.id)
            });
            var index = this.Peers.indexOf(connection);
            if (index >= 0)
                this.Peers.splice(index, 1);
        }



        private createPeerConnection(id: string): RTCPeerConnection {
           

            

            var rtcPeerConnection = new RTCPeerConnection(this.rtcConfig);

            rtcPeerConnection.onsignalingstatechange = (state) => {};
            rtcPeerConnection.onicecandidate = (event: any) => {
                if (!event || !event.candidate) return;
                if (event.candidate) {
                    var msg = {
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
                var connection = this.Peers.filter((p) => {
                    return p.id === id;
                })[0];
                connection.streams.push(event.stream);
                this.onRemoteStream(event.stream, connection);
            };
            return rtcPeerConnection;
        }
        public onRemoteStream(stream: MediaStream, connection: Connection) {};
        private getPeerConnection(id: string): webkitRTCPeerConnection {
            var match = this.Peers.filter((connection: Connection) => {
                return connection.id === id;
            });
            if (match.length === 0) {
                var pc = new Connection(id,this.createPeerConnection(id));
                this.Peers.push(pc);

                return pc.rtcPeerConnection;
            }
            return match[0].rtcPeerConnection;
        }


        private createOffer(peer: PeerConnection) {
            var peerConnection = this.createPeerConnection(peer.peerId);
            this.localSteams.forEach((stream) => {
                peerConnection.addStream(stream);
            });

            peerConnection.createOffer((localDescription: RTCSessionDescription) => {

                peerConnection.setLocalDescription(localDescription, () => {
                    var offer = {
                        sender: this.localPeerId,
                        recipient: peer.peerId,
                        message: JSON.stringify(localDescription)
                    };
                    this.brokerChannel.Invoke("contextSignal",
                        offer, "broker"
                    );

                }, function(err) {
                  
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
        connect(peerConnections: Array < PeerConnection > ) {
            peerConnections.forEach((peer: PeerConnection) => {
                var pc = new Connection(peer.peerId,this.createOffer(peer));
                this.Peers.push(pc);
            })
        }
    }

    export class Factory {
        private ws: WebSocket;
        private toQuery(obj: any) {
            return `?${Object.keys(obj).map(key => (encodeURIComponent(key) + "=" +
                encodeURIComponent(obj[key]))).join("&")}`;
        }
        private channels: Array < ThorIOClient.Channel > ;
        public IsConnected: boolean;
        constructor(private url: string, controllers: Array < string > , params?: any) {
            var self = this;
            this.channels = new Array < ThorIOClient.Channel > ();
            this.ws = new WebSocket(url + this.toQuery(params || {}));
            this.ws.onmessage = event => {
                var message = JSON.parse(event.data);

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
            var channel = this.channels.filter(pre => (pre.alias === alias));
            return channel[0];
        };
        RemoveChannel() {
            throw "Not yet implemented";
        }
        OnOpen(event: any) {};
        OnError(error: any) {
            console.error(error);
        }
        OnClose(event: any) {
            console.error(event);
        }
        
    }
    export class Message {
        private _T: string;
        get T(): string {
            return this._T;
        }
        set T(v: string) {
            this._T = v;
        }
        private _D: any;
        get D(): any {
            return this._D;
        }
        set D(v: any) {
            this._D = v;
        }
        private _C: string;
        get C(): string {
            return this._C
        };
        set C(value: string) {
            this._C = value
        };
        get JSON(): any {
            return {
                T: this.T,
                D: JSON.stringify(this.D),
                C: this.C
            }
        };
        constructor(topic: string, object: any, controller: string) {
            this.D = object;
            this.T = topic;
            this.C = controller;
        }
        toString() {
            return JSON.stringify(this.JSON);
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

    export class Channel {
      
        public IsConnected: boolean;
        listeners: Array < ThorIOClient.Listener > ;
        constructor(public alias: string, private ws: WebSocket) {
            this.listeners = new Array < ThorIOClient.Listener > ();
            this.IsConnected = false;
        }
        Connect() {
            this.ws.send(new ThorIOClient.Message("$connect_", {}, this.alias));
            return this;
        };
        Close() {
            this.ws.send(new ThorIOClient.Message("$close_", {}, this.alias));
            return this;
        };
        Subscribe(topic: string, callback: any) {
            this.On(topic, callback);
            this.ws.send(new ThorIOClient.Message("subscribe", {
                topic: topic,
                controller: this.alias
            }, this.alias));
            return this;
        };
        Unsubscribe(topic: string) {
            this.ws.send(new ThorIOClient.Message("unsubscribe", {
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
            var listener = this.listeners.filter(
                (pre: Listener) => {
                    return pre.topic === topic;
                }
            );
            return listener[0];
        }
        Off(topic: string) {

            var index =
                this.listeners.indexOf(this.findListener(topic));
            if (index >= 0) this.listeners.splice(index, 1);
            return this;
        };
        Invoke(topic: string, d: any, c ? : string) {
            this.ws.send(new ThorIOClient.Message(topic, d, c || this.alias));
            return this;
        };
        SetProperty(propName: string, propValue: any, controller ? : string) {
           
            this.Invoke(propName, propValue, controller || this.alias);
            return this;
        };
        Dispatch(topic: string, data: any) {
            if (topic === "$open_") {
                data = JSON.parse(data);
                this.IsConnected = true;
                this.OnOpen(data);
                return;
            } else if (topic === "$close_") {
                this.OnClose([JSON.parse(data)]);
                this.IsConnected = false;
            } else {
                var listener = this.findListener(topic);
                if (listener) listener.fn(JSON.parse(data));
            }
        };
        OnOpen(event: any) {};

        OnClose(event: any) {};
    }
}