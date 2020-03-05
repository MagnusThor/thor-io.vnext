let express = require("express");

let app = express();
 
var thorio = require("../index").ThorIO;

// import your controllers here...
import {MyController} from '../test/controllers/MyController'
import { ThorIO } from '../src/ThorIO';
import { BrokerController } from '../src/Controllers/Broker/BrokerController';

let Server = new ThorIO(
    [
        MyController,
        BrokerController
    ]
); 

require("express-ws")(app);

app.use("/", express.static("debug"));
app.use("/lib", express.static("node_modules")); 

app.ws("/", function (ws, req) {    
       Server.addWebSocket(ws,req);
});

var port = process.env.PORT || 1337;
app.listen(port);

console.log("thor-io is serving on",port.toString());