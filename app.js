var server = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server: server }),
    express = require('express'),
    app = express(),
    port = 3000;

function client(ws,name){
  this.ws = ws;
  if (name === undefined){
    this.after("name",{
      type:"getName"
    }).then(function(resp){
      console.log(resp);
    });
  }
}

client.prototype.after = function(hook,data){
  this.send(data);
  return new Promise(function(resolve, reject) {
    this.hooks[hook] = resolve;
  });
};

client.prototype.send = function(data){
  this.ws.send(JSON.stringify(data));
};

//Web socket
wss.on('connection', function(ws) {
  new client(ws);
});

//Express app
app.use(express.static(__dirname + '/client'));

//Bind to http server and start
server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port); });
