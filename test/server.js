// server.js
var express = require("express")
app = express()

var thorio = require("../dist/index.js").ThorIO

var testController = require("../test/TestController.js")
var defaultControllers = require("../dist/thor-io.controllers.js").ThorIOControllers

var controllers = [
  testController.TestController,
  defaultControllers.BrokerController 

]

var thorIO = new thorio.Engine(controllers)

var expressWs = require("express-ws")(app)
app.use("/test", express.static("test"))
app.use("/test/src", express.static("dist"))

app.ws("/", function (ws, req) {
  thorIO.addConnection(ws)
})

var port = process.env.PORT || 1337
app.listen(port)
