declare namespace ThorIOClient {
    class Message {
        T: string;
        D: any;
        C: string;
        id: string;
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
        rtcPeerConnection: webkitRTCPeerConnection;
        streams: Array<any>;
        constructor(id: string, rtcPeerConnection: RTCPeerConnection);
    }
    class WebRTC {
        private brokerChannel;
        private rtcConfig;
        Peers: Array<Connection>;
        Peer: RTCPeerConnection;
        localPeerId: string;
        localSteams: Array<any>;
        constructor(brokerChannel: ThorIOClient.Channel, rtcConfig: RTCConfiguration);
        private onCandidate(event);
        private onAnswer(event);
        private onOffer(event);
        addLocalStream(stream: any): this;
        private onConnected(p);
        private onDisconnected(p);
        remoteStreamlost(streamId: string, peerId: string): void;
        private removePeerConnection(id);
        private createPeerConnection(id);
        onRemoteStream(stream: MediaStream, connection: Connection): void;
        private getPeerConnection(id);
        private createOffer(peer);
        connect(peerConnections: Array<PeerConnection>): void;
    }
    class Factory {
        private url;
        private ws;
        private toQuery(obj);
        private channels;
        IsConnected: boolean;
        constructor(url: string, controllers: Array<string>, params?: any);
        Close(): void;
        GetChannel(alias: string): ThorIOClient.Channel;
        RemoveChannel(): void;
        OnOpen(event: any): void;
        OnError(error: any): void;
        OnClose(event: any): void;
    }
    class Listener {
        fn: Function;
        topic: string;
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
    class Channel {
        alias: string;
        private ws;
        IsConnected: boolean;
        listeners: Array<ThorIOClient.Listener>;
        promisedMessages: Array<PromisedMessage>;
        constructor(alias: string, ws: WebSocket);
        Connect(): this;
        Close(): this;
        Subscribe(topic: string, callback: any): this;
        Unsubscribe(topic: string): this;
        On(topic: string, fn: any): this;
        private findListener(topic);
        Off(topic: string): this;
        Invoke(topic: string, d: any, c?: string): this;
        SetProperty(propName: string, propValue: any, controller?: string): this;
        GetProperty(propName: string, controller?: string): Promise<any>;
        Dispatch(topic: string, data: any): void;
        OnOpen(event: any): void;
        OnClose(event: any): void;
    }
}
