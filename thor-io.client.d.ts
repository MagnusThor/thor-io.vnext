declare namespace ThorIO.Client {
    class Message {
        T: string;
        D: any;
        C: string;
        JSON: any;
        constructor(topic: string, object: any, controller: string, id?: string);
        toString(): string;
    }
    class PeerConnection {
        context: string;
        peerId: string;
    }
    class Connection {
        id: string;
        rtcPeerConnection: RTCPeerConnection;
        streams: Array<any>;
        constructor(id: string, rtcPeerConnection: RTCPeerConnection);
    }
    class WebRTC {
        private brokerProxy;
        private rtcConfig;
        Peers: Array<Connection>;
        Peer: RTCPeerConnection;
        localPeerId: string;
        localSteams: Array<any>;
        Errors: Array<any>;
        constructor(brokerProxy: ThorIO.Client.Proxy, rtcConfig: RTCConfiguration);
        private signalHandlers();
        private addError(err);
        onError(err: any): void;
        onContextCreated(peerConnection: PeerConnection): void;
        onContextChanged(context: string): void;
        onRemoteStream(stream: MediaStream, connection: Connection): void;
        onRemoteStreamlost(streamId: string, peerId: string): void;
        onLocalSteam(stream: MediaStream): void;
        onContextConnected(rtcPeerConnection: RTCPeerConnection): void;
        onContextDisconnected(rtcPeerConnection: RTCPeerConnection): void;
        onConnectTo(peerConnections: Array<PeerConnection>): void;
        onConnected(peerId: string): void;
        onDisconnected(peerId: string): void;
        private onCandidate(event);
        private onAnswer(event);
        private onOffer(event);
        addLocalStream(stream: any): WebRTC;
        addIceServer(iceServer: RTCIceServer): WebRTC;
        private removePeerConnection(id);
        private createPeerConnection(id);
        private getPeerConnection(id);
        private createOffer(peer);
        disconnect(): void;
        connect(peerConnections: Array<PeerConnection>): WebRTC;
        changeContext(context: string): WebRTC;
        connectPeers(): void;
        connectContext(): void;
    }
    class Factory {
        private url;
        private ws;
        private toQuery(obj);
        private proxys;
        IsConnected: boolean;
        constructor(url: string, controllers: Array<string>, params?: any);
        Close(): void;
        GetProxy(alias: string): ThorIO.Client.Proxy;
        RemoveProxy(alias: string): void;
        OnOpen(proxys: any): void;
        OnError(error: any): void;
        OnClose(event: any): void;
    }
    class Listener {
        fn: Function;
        topic: string;
        count: number;
        constructor(topic: string, fn: Function);
    }
    class Utils {
        static newGuid(): string;
    }
    class PromisedMessage {
        resolve: Function;
        messageId: string;
        constructor(id: string, resolve: Function);
    }
    class PropertyMessage {
        name: string;
        value: any;
        messageId: string;
        constructor();
    }
    class Proxy {
        alias: string;
        private ws;
        IsConnected: boolean;
        private promisedMessages;
        private listeners;
        constructor(alias: string, ws: WebSocket);
        OnOpen(event: any): void;
        OnClose(event: any): void;
        Connect(): this;
        Close(): this;
        Subscribe(topic: string, callback: any): Listener;
        Unsubscribe(topic: string): void;
        On(topic: string, fn: any): Listener;
        private findListener(topic);
        Off(topic: string): void;
        Invoke(topic: string, data: any, controller?: string): ThorIO.Client.Proxy;
        SetProperty(propName: string, propValue: any, controller?: string): ThorIO.Client.Proxy;
        GetProperty(propName: string, controller?: string): Promise<any>;
        Dispatch(topic: string, data: any): void;
    }
}
