var ChatMessage = (function () {
    function ChatMessage(age, message) {
        this.age = age;
        this.message = message;
    }
    return ChatMessage;
}());
var ChatClient = (function () {
    function ChatClient() {
        var _this = this;
        this.factory = new ThorIO.Client.Factory(location.origin.replace(/^http/, 'ws'), ["chat"]);
        this.factory.OnOpen = function (proxy) {
            proxy.On("chatMessage", function (message) {
                _this.showMessage(message);
            });
            proxy.Connect();
        };
        this.factory.OnClose = function (reason) {
            console.error(reason);
        };
        this.factory.OnError = function (err) {
            console.error(err);
        };
        this.txtMessage = document.querySelector("#chat-message");
        this.txtMessage.addEventListener("keyup", function (event) {
            _this.sendMessage(event);
        });
        this.txtAge = document.querySelector("#chat-age");
        this.txtAge.addEventListener("change", function (event) {
            _this.setAge(event.target.value);
        });
    }
    ChatClient.prototype.showMessage = function (chatMessage) {
        var el = document.createElement("p");
        el.textContent = chatMessage.message;
        document.querySelector("#chatMessages").appendChild(el);
    };
    ChatClient.prototype.setAge = function (age) {
        this.factory.GetProxy("chat").SetProperty("age", age);
    };
    ChatClient.prototype.sendMessage = function (event) {
        if (event.keyCode === 13) {
            this.factory.GetProxy("chat").Invoke("sendChatMessage", new ChatMessage(parseInt(this.txtAge.value), this.txtMessage.value));
        }
    };
    return ChatClient;
}());
//# sourceMappingURL=chat-client.js.map