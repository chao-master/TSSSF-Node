/*jshint esnext:true*/
//Longpolling...
WebSocket = require("ws");
connections = {};

var CLIENT_TIMEOUT = 60*1000,
    CHECKRATE = 30*1000,
    POLL_TIMEOUT = 30*1000;

setInterval(function(){
  console.log("Checking for dead longpolls");
  var keys = Object.keys(connections),
      now = Date.now();
  for(var i=0;i<keys.length;i++){
    var proxy = connections[keys[i]];
    if (proxy.lastSeen < now-CLIENT_TIMEOUT){
      proxy.ws.close();
    }
  }
},CHECKRATE);

function connection(proxyTo,forIp){
  this.proxyTo = proxyTo;
  console.info("Long poll proxying to",proxyTo,"for",forIp);
  this.id = undefined;
  this.queue = [];
  this.notify = undefined;
}
connection.prototype.getId = function(){
  return new Promise(good => {
    this.ws = new WebSocket("ws://"+this.proxyTo);
    this.ws.on("message",d=>{
      if(this.id === undefined){
        var data = JSON.parse(d);
        if(data.type == "self"){
          this.id = data.client.id;
          good(this.id);
        }
      }
      this.queue.push(d);
      if(this.notify){
        this.notify();
      }
    });
  });
};

connection.prototype.send = function(send,slave){
  this.lastSeen = Date.now();
  if (send) {
    this.ws.send(send);
  }
  if (slave) {
    return;
  } else {
    return new Promise((good,bad) => {
      this.notify = good;
      if(this.queue.length>0) good();
      setTimeout(bad,POLL_TIMEOUT);
    }).then(_=>this.queue[0])
    .catch(_=>"{}")
    .then(n=>{this.notify=undefined;return n;});
  }
};

function longPoll(req,res){
  var proxy;
  if (req.query.key){
    proxy = connections[req.query.key];
    if (proxy === undefined){
      res.json({_err:"bad key"});
    } else {
      var reply = proxy.send(req.query.msg,req.query.slave)
      if(reply !== undefined){
        reply.then(reply => res.send(reply))
        .then(_=>proxy.queue.shift());
      }
    }
  } else {
    var host = req.get("Host");
    if(req.query.query){
        host += "/"+req.query.query;
    }
    proxy = new connection(host,req.ips);
    proxy.getId().then(id=>{
      res.json({_key:id});
      connections[id] = proxy;
    });
  }
}

module.exports = longPoll;
