declare namespace ThorIOClient {
    class Factory {
        private ws;
        private toQuery(obj);
        private channels;
        constructor(url: string, controllers: Array<string>, params: any);
        Close(): void;
        GetChannel(alias: string): ThorIOClient.Channel;
        RemoveChannel(): void;
        OnOpen(event: any): void;
    }
    class Message {
        private _T;
        T: string;
        private _D;
        D: any;
        private _C;
        C: string;
        JSON: any;
        constructor(topic: string, object: any, controller: string);
        toString(): string;
    }
    class Listener {
        fn: Function;
        topic: string;
        constructor(topic: string, fn: Function);
    }
    class Channel {
        alias: string;
        private ws;
        IsConnected: boolean;
        listeners: Array<ThorIOClient.Listener>;
        constructor(alias: string, ws: WebSocket);
        Connect(): this;
        Close(): this;
        Subscribe(t: string, fn: any): this;
        Unsubscribe(t: string): this;
        On(t: string, fn: any): this;
        private findListener(t);
        Off(t: string): this;
        Invoke(t: string, d: any, c?: string): this;
        SetProperty(name: string, value: any, controller?: string): this;
        Dispatch(t: string, d: any): void;
        OnOpen(message: any): void;
        OnClose(message: any): void;
    }
}
