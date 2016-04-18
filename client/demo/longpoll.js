/*jshint esnext:true*/
LongPoll = function(addr){
  this.addr = addr;
  this._key = undefined;
  this.getForever();
  this.toSend = [];
};
LongPoll.prototype.getForever = function(){
  var addr = this.addr+"?"+(
    [["key",this._key],["msg",this.toSend.shift()]]
    .filter(v=>v[1])
    .map(v=>encodeURIComponent(v[0])+"="+encodeURIComponent(v[1]))
    .join("&")
  );
  console.debug(addr);
  request(addr).then(r=>r.json()).then(data=>{
    if (data._key){
      this._key = data._key;
    } else if (data.type){
      if (this.onmessage){
        this.onmessage(data);
      }
    }
  }).then(_=>this.getForever());
};
