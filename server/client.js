/*jshint esnext:true*/
var console = require("../colourConsole");

function Client(ws,server,requestedName,requestedRoom){
  this.id = server.addClient(this);
  this.oneHooks = {};
  this.hooks = {};
  ws.on("message",this.onMessage.bind(this));
  ws.on("close",this.onClose.bind(this));

  this.room = undefined;
  this.name = undefined;

  this.ws = ws;
  this.server = server;

  console.info("New Client has connected id:",this.id);

  this.sendPacket("self");
  this.awaitNameChoice(requestedName).then( name => {
    console.info("Client",this.id,"has chosen name:",name);
    this.name = name;
    return this.awaitRoomChoice(requestedRoom);
  }).then( room => {
    this.join(room);
  }).catch( e => {
    console.error(e.stack);
  });
}

/*
* Requests a name from the client
* Returns: A promise which resolves to the chosen name
*/
Client.prototype.awaitNameChoice = function(name){
  var that=this;
  function loop(resp){
    var name = resp.name;
    if(name === undefined){
      that.send({type:"getName",msg:name + " is not a valid name"});
      return that.after("name").then(loop);
    } else {
      return name;
    }
  }

  if(name !== undefined){
    return Promise.resolve(loop({name:name}));
  } else {
    this.send({type:"getName",msg:"Please provide a name"});
    return this.after("name").then(loop);
  }
};

/*
* Requests a room the client wishes to join
* Returns: A promise which resolves to the chosen room's id or "+NEW" for a new room
*/
Client.prototype.awaitRoomChoice = function(room){
  var that=this;
  function loop(resp){
    var room;
    if(resp.room == "+NEW"){
      room = that.server.newRoom();
    } else {
      room = that.server.rooms[resp.room];
    }
    if(room === undefined){
      that.send({type:"error",msg:room+" is not a valid room"});
      that.sendPacket("rooms");
      return that.after("join").then(loop);
    } else {
      return room;
    }
  }

  if (room !== undefined){
    return Promise.resolve(loop({room:room}));
  } else {
    this.sendPacket("rooms");
    return this.after("join").then(loop);
  }
};

/*
* Adds the client into the given room
*/
Client.prototype.join = function(room){
  if(this.room !== undefined){
    this.room.removeClient(this);
  }
  this.server.rooms[room.id].addClient(this);
  this.room = this.server.rooms[room.id];
};

Client.prototype.onMessage = function(data){
  data = JSON.parse(data);
  var type = data.type;
  delete data.type;

  if(this.oneHooks[type] !== undefined){
    var tmp = this.oneHooks[type];
    delete this.oneHooks[type];
    try {
      tmp.call(this,data,this);
    } catch (e) {
      this.send({type:"error",msg:e.message?e.message:e});
      console.error(e.stack?e.stack:e);
    }
  } else {
    var resolvers = [this,this.room,this.room.game,this.server], resolved = false;
    for(var i=0;i<resolvers.length;i++){
      var r = resolvers[i];
      if (r !== undefined && r.hooks[type] !== undefined){
        try {
          r.hooks[type].call(r,data,this);
        } catch (e) {
          this.send({type:"error",msg:e.message?e.message:e});
          console.error(e.stack?e.stack:e);
        }
        resolved = true;
        break;
      }
    }
    if (!resolved){
      console.warn("No handler defined for",type);
    }
  }
};

Client.prototype.onClose = function(code,msg){
  console.info("Client",this.id,"has disconnected");
  if(this.room){
    this.room.removeClient(this);
  }
  delete this.server.clients[this.id];
};

Client.prototype.after = function(hook){
  return new Promise(good=>this.oneHooks[hook] = good);
};

Client.prototype.send = function(data){
  try{
    this.ws.send(JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

Client.prototype.sendPacket = function(packet){
  this.send(this.packet(packet));
};

Client.prototype.toJSON = function(){
  return {
    "type":"Client",
    "name":this.name,
    "id":this.id
  };
};

/*Client Packets*/
Client.prototype.packet = function(packet){
  if (this.packets[packet] !== undefined){
    var rtn = this.packets[packet].call(this);
    rtn.type = packet;
    rtn.room = this;
    return rtn;
  } else if (this.room !== undefined) {
    return this.room.packet(packet);
  } else {
    return this.server.packet(packet);
  }
};

Client.prototype.packets =  {
  self: function(){
    return {client:this};
  }
};

module.exports = Client;
