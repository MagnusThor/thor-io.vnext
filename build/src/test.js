"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BrokerController_1 = require("./Controllers/BrokerController/BrokerController");
const ThorIOServer_1 = require("./ThorIOServer");
const thorio = ThorIOServer_1.ThorIOServer.createInstance([BrokerController_1.BrokerController]);
