/*jshint esnext:true*/
LongPoll = function(addr,query){
  this.addr = addr;
  this._key = undefined;
  this.getForever(query);
};
LongPoll.prototype.getAddr = function(query){
  query.push([["key"],[this._key]]);
  return this.addr+"?"+(query.filter(v=>v[1])
    .map(v=>encodeURIComponent(v[0])+"="+encodeURIComponent(v[1]))
    .join("&")
  );
};

LongPoll.prototype.getForever = function(query){
  fetch(this.getAddr([["query"],[query]])).then(r=>r.json()).then(data=>{
    if (data._key){
      this._key = data._key;
    } else if (data.type){
      if (this.onmessage){
        this.onmessage({data:JSON.stringify(data)});
      }
    }
  }).then(_=>this.getForever());
};
LongPoll.prototype.send = function(data){
  fetch(this.getAddr([["msg",data],["slave","1"]]));
};
