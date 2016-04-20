/*jshint esnext:true*/
var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .alias('H', 'host').default('H','0.0.0.0')
    .alias('p', 'port').default('p','3000')
    .boolean('lonpoll')
    .help('h').alias('h', 'help')
    .argv;
var console = require("./colourConsole");
var colors = require('colors');

var httpServer = require('http').createServer(),
    url = require('url'),
    WebSocket = require('ws'),
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
if(argv.longpoll){
  console.log("Starting longpilling on /ws");
  app.get("/ws",require("./longpoll"));
  app.enable('trust proxy');
}

//Bind to http server and start
httpServer.on('request', app);
httpServer.listen(argv.p,argv.H, function () {
  console.log('Listening on',httpServer.address());
});

//Do stdin
commands = {
  "clients":function(){
    var keys = Object.keys(server.clients);
    console._log(keys.length+" clients connected");
    keys.forEach(k=>{
      var c=server.clients[k],
          r=c.room? c.room.id : "no room";
      console._log(c.id+"\t"+c.name+"\t"+r);
    });
  },"rooms":function(){
    var keys = Object.keys(server.clients);
    console._log(keys.length+" rooms connected");
    keys.forEach(k=>{
      var r=server.rooms[k];
      console._log(r.id+"\t"+r.room.id.green);
    });
  }
};

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk === null) return;
  var input = chunk.trim();
  if(commands[input]) commands[input]();
});
