/*jshint esnext:true*/
//Longpolling...
WebSocket = require("ws");

connections = {};

function connection(proxyTo){
  this.proxyTo = proxyTo;
  console.info("Long poll proxying to",proxyTo);
  this.id = undefined;
  this.queue = [];
  this.notify = undefined;
}
connection.prototype.getId = function(){
  return new Promise(good => {
    this.ws = new WebSocket("ws://"+this.proxyTo);
    this.ws.on("message",d=>{
      console.debug("queue",d,this.notify);
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
connection.prototype.send = function(send){
  if (send) {
    this.ws.send(send);
  }
  return new Promise((good,bad) => {
    this.notify = good;
    if(this.queue.length>0) good();
    setTimeout(bad,10000)
  }).then(_=>this.queue[0])
  .catch(_=>"{}")
  .then(n=>{this.notify=undefined;return n});
};

function longPoll(req,res){
  if (req.query.key){
    var proxy = connections[req.query.key];
    if (proxy === undefined){
      res.json({_err:"bad key"});
    } else {
      proxy.send(req.query.msg)
        .then(reply => res.send(reply))
        .then(_=>proxy.queue.shift());
    }
  } else {
    var proxy = new connection(req.get("Host"));
    proxy.getId().then(id=>{
      res.json({_key:id});
      connections[id] = proxy;
    });
  }
}

module.exports = longPoll;
