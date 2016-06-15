
 namespace ThorIOClient {
    export class Factory {
        private ws: WebSocket;
        private toQuery(obj: any) {
            return `?${Object.keys(obj).map(key => (encodeURIComponent(key) + "=" +
                encodeURIComponent(obj[key]))).join("&")}`;
        }
        private channels: Array<ThorIOClient.Channel>;
        public IsConnected: boolean;
        constructor(url: string, controllers: Array<string>, params: any) {
            var self = this;
            this.channels = new Array<ThorIOClient.Channel>();
            this.ws = new WebSocket(url + this.toQuery(params));
            this.ws.onmessage = event => {
                var message = JSON.parse(event.data);
               this.GetChannel(message.C).Dispatch(message.T, message.D);
            };
            this.ws.onclose = event => {
                this.IsConnected = false;
                  this.OnClose.apply(this,[event]);
            }
            this.ws.onerror = error => {
                this.OnError.apply(this,[error]);
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
        GetChannel(alias: string):ThorIOClient.Channel {
            var channel = this.channels.filter(pre => (pre.alias === alias));
            return channel[0];
        };
        RemoveChannel() {
            throw "Not yet implemented";
        }
        OnOpen(event: any) {
        };
        OnError(error:any){
            console.error(error);
        }
        OnClose(event:any){
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
        get C(): string { return this._C };
        set C(value: string) { this._C = value };
        get JSON(): any {
            return {
                T: this.T, D: JSON.stringify(this.D), C: this.C
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
        public alias: string;
        private ws: WebSocket;
        public IsConnected: boolean;
        listeners: Array<ThorIOClient.Listener>;
        constructor(alias: string, ws: WebSocket) {
            this.listeners = new Array<ThorIOClient.Listener>();
            this.alias = alias;
            this.ws = ws;
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
        Subscribe(t: string, fn: any) {
            this.On(t, fn);
            this.ws.send(new ThorIOClient.Message("subscribe", { topic: t, controller: this.alias }, this.alias));
            return this;
        };
        Unsubscribe(t: string) {
            this.ws.send(new ThorIOClient.Message("unsubscribe", { topic: t, controller: this.alias }, this.alias));
            return this;
        };
        On(t: string, fn: any) {
            this.listeners.push(new ThorIOClient.Listener(t, fn));
            return this;
        };
        private findListener(t:string):Listener{
            var listener =
                 this.listeners.filter(pre => (pre.topic === t))[0];
                 return listener[0];
        }
        Off(t: string) {
        
            var index =
                this.listeners.indexOf(this.findListener(t));
            if (index >= 0) this.listeners.splice(index, 1);
            return this;
        };
        Invoke(t: string, d: any, c?: string) {
            this.ws.send(new ThorIOClient.Message(t, d, c || this.alias));
            return this;
        };
        SetProperty(name: string, value: any, controller?: string) {
            const property = `$set_${name}`;
            this.Invoke(property, value, controller || this.alias);
            return this;
        };
        Dispatch(t: string, d: any) {
            if (t === "$open_") {
                d = JSON.parse(d);
                localStorage.setItem("pid", d.PI);
                this.IsConnected = true;
                this.OnOpen(d);
                return;
            } else if (t === "$close_") {
                this.OnClose([JSON.parse(d)]);
                this.IsConnected = false;
            } else if (this.hasOwnProperty(t)) {
                // this[t].apply(this, [JSON.parse(d)]);
            } else {
                var listener = this.findListener(t);
                if (listener) listener.fn(JSON.parse(d));
            }
        };
        OnOpen(message: any) {
        };

        OnClose(message: any) {
        };
    }
}

