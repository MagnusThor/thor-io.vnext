let express = require("express");

let app = express();

import { ThorIO } from '../src/ThorIO';

// import your controllers here...
import { MyController } from '../example/controllers/MyController'
import { BrokerController } from '../src/Controllers/BrokerController/Broker';


let Server = new ThorIO(
    [
        MyController,
        BrokerController
    ]
);

require("express-ws")(app);

app.use("/", express.static("example"));

app.ws("/", (ws: WebSocket, req: any) => { 
    Server.addWebSocket(ws, req);
});

var port = process.env.PORT || 1337;
app.listen(port);
console.log("thor-io is serving on", port.toString());