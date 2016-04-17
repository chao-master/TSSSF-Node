var console = require("./colourConsole");

var httpServer = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server: httpServer }),
    express = require('express'),
    app = express(),
    port = 3000;

var client = require("./server/client.js");
var gameServer = require("./server/server.js");
var server = new gameServer();

//Websockets
wss.on('connection', function(ws) {
  new client(ws,server);
});

//Express app
app.use(express.static(__dirname + '/client'));

//Bind to http server and start
httpServer.on('request', app);
httpServer.listen(port, function () {
  console.log('Listening on',httpServer.address().port);
});
