var server = require('http').createServer(),
    url = require('url'),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server: server }),
    express = require('express'),
    app = express(),
    port = 3000;

//Web socket
wss.on('connection', function(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  ws.send('something');
});

//Express app
app.use(express.static(__dirname + '/client'));



//Bind to http server and start
server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
