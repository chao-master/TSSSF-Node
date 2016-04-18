/*jshint esnext:true*/
//Longpolling...
WebSocket = require("ws");

connections = {};

setInterval(function(){
  console.debug("Checking for dead longpolls")
  var keys = Object.keys(connections),
      now = Date.now()
  for(var i=0;i<keys.length;i++){
    var proxy = connections[keys[i]];
    if (proxy.lastSeen < now-60000){
      proxy.ws.close();
    }
  }
},30000)

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
    slaveObj = {}
    slaveObj.next = (_=>slaveObj)
    slaveObj.catch = slaveObj.next
    return slaveObj
  } else {
    return new Promise((good,bad) => {
      this.notify = good;
      if(this.queue.length>0) good();
      setTimeout(bad,10000)
    }).then(_=>this.queue[0])
    .catch(_=>"{}")
    .then(n=>{this.notify=undefined;return n});
  }
};

function longPoll(req,res){
  if (req.query.key){
    var proxy = connections[req.query.key];
    if (proxy === undefined){
      res.json({_err:"bad key"});
    } else {
      proxy.send(req.query.msg,req.query.slave)
        .then(reply => res.send(reply))
        .then(_=>proxy.queue.shift());
    }
  } else {
    var host = req.get("Host");
    if(req.query.query){
        host += "/"+req.query.query;
    }
    console.debug(host);
    var proxy = new connection(host,req.ips);
    proxy.getId().then(id=>{
      res.json({_key:id});
      connections[id] = proxy;
    });
  }
}

module.exports = longPoll;
