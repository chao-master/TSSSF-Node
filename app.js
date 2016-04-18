var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .alias('H', 'host').default('H','0.0.0.0')
    .alias('p', 'port').default('p','3000')
    .help('h').alias('h', 'help')
    .argv;
var console = require("./colourConsole");

var httpServer = require('http').createServer(),
    url = require('url'),
    WebSocket = require('ws')
    WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({ server: httpServer }),
    express = require('express'),
    app = express(),
    port = 3000;

var client = require("./server/client.js");
var gameServer = require("./server/server.js");
var server = new gameServer();

//Websockets
wss.on('connection', function(ws) {
  var query = url.parse(ws.upgradeReq.url, true).query;
  new client(ws,server,query.name,query.room);
});

//Express app
app.use(express.static(__dirname + '/client'));

//Longpolling...
app.get("/ws",require("./longpoll"))

//Bind to http server and start
httpServer.on('request', app);
httpServer.listen(argv.p,argv.H, function () {
  console.log('Listening on',httpServer.address());
});
