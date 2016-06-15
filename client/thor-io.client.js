var ThorIOClient;
(function (ThorIOClient) {
    var Factory = (function () {
        function Factory(url, controllers, params) {
            var _this = this;
            var self = this;
            this.channels = new Array();
            this.ws = new WebSocket(url + this.toQuery(params));
            this.ws.onmessage = function (event) {
                var message = JSON.parse(event.data);
                console.log(message);
                _this.GetChannel(message.C).Dispatch(message.T, message.D);
            };
            this.ws.onclose = function (event) {
                _this.OnClose.apply(_this, [event]);
            };
            this.ws.onerror = function (error) {
                _this.OnError.apply(_this, [error]);
            };
            this.ws.onopen = function (event) {
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
        Factory.prototype.OnOpen = function (event) {
        };
        ;
        Factory.prototype.OnError = function (error) {
            console.error(error);
        };
        Factory.prototype.OnClose = function (event) {
            console.error(event);
        };
        return Factory;
    })();
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
            get: function () { return this._C; },
            set: function (value) { this._C = value; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        Object.defineProperty(Message.prototype, "JSON", {
            get: function () {
                return {
                    T: this.T, D: JSON.stringify(this.D), C: this.C
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
    })();
    ThorIOClient.Message = Message;
    var Listener = (function () {
        function Listener(topic, fn) {
            this.fn = fn;
            this.topic = topic;
        }
        return Listener;
    })();
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
            this.ws.send(new ThorIOClient.Message("subscribe", { topic: t, controller: this.alias }, this.alias));
            return this;
        };
        ;
        Channel.prototype.Unsubscribe = function (t) {
            this.ws.send(new ThorIOClient.Message("unsubscribe", { topic: t, controller: this.alias }, this.alias));
            return this;
        };
        ;
        Channel.prototype.On = function (t, fn) {
            this.listeners.push(new ThorIOClient.Listener(t, fn));
            return this;
        };
        ;
        Channel.prototype.findListener = function (t) {
            var listener = this.listeners.filter(function (pre) { return (pre.topic === t); })[0];
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
            var property = "$set_" + name;
            this.Invoke(property, value, controller || this.alias);
            return this;
        };
        ;
        Channel.prototype.Dispatch = function (t, d) {
            if (t === "$open_") {
                d = JSON.parse(d);
                localStorage.setItem("pid", d.PI);
                this.IsConnected = true;
                this.OnOpen(d);
                return;
            }
            else if (t === "$close_") {
                this.OnClose([JSON.parse(d)]);
                this.IsConnected = false;
            }
            else if (this.hasOwnProperty(t)) {
            }
            else {
                var listener = this.findListener(t);
                if (listener)
                    listener.fn(JSON.parse(d));
            }
        };
        ;
        Channel.prototype.OnOpen = function (message) {
        };
        ;
        Channel.prototype.OnClose = function (message) {
        };
        ;
        return Channel;
    })();
    ThorIOClient.Channel = Channel;
})(ThorIOClient || (ThorIOClient = {}));
//# sourceMappingURL=thor-io.client.js.map