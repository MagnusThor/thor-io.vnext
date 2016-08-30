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
        this.client = new ThorIO.Factory(location.origin.replace(/^http/, 'ws'), ["chat"]);
        this.client.OnOpen = function (proxy) {
            proxy.On("chatMessage", function (message) {
                _this.showMessage(message);
            });
            proxy.Connect();
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
        this.client.GetProxy("chat").SetProperty("age", age);
    };
    ChatClient.prototype.sendMessage = function (event) {
        if (event.keyCode === 13) {
            this.client.GetProxy("chat").Invoke("sendChatMessage", new ChatMessage(parseInt(this.txtAge.value), this.txtMessage.value));
        }
    };
    return ChatClient;
}());
//# sourceMappingURL=chat-client.js.map