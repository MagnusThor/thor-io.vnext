import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import express from 'express';
import webSocket from 'ws';

import { MyController } from './controllers/MyController';
import { BrokerController } from '../src/Controllers/BrokerController/Broker';
import { ThorIO } from '..';

console.clear();

let port = +process.env.PORT;
let server: http.Server | https.Server;
let app = express();
let rtc = new ThorIO(
    [
        MyController,
        BrokerController
    ]
);


let rootPath = path.resolve('.');

let clientPath = path.join(rootPath, "example");


if (fs.existsSync(clientPath)) {
    console.log(`Serving client files from ${clientPath}.`);
    app.use("/", express.static(clientPath));
}
else {
    console.log(`Serving no client files.`);
    app.get("/", (_, res) => res.send('Kollokvium WebSocket Server is running'));
}

port = port || 1337;
server = http.createServer((req, res) => {
    app(req, res);
});


const ws = new webSocket.Server({ server });
ws.on('connection', (ws, req) => {





    rtc.addWebSocket(ws, req);
});

server.listen(port);

console.log(`Kollokvium version ${process.env.KOLLOKVIUM_VERSION} is listening on ${port}`);