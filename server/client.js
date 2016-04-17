/*jshint esnext:true*/

var console = require("../colourConsole");

function Client(ws,server){
  this.id = server.addClient(this);
  this.oneHooks = {};
  this.hooks = {};
  ws.on("message",this.onMessage.bind(this));

  this.room = undefined;
  this.name = undefined;

  this.ws = ws;
  this.server = server;

  console.info("New Client has connected id:",this.id);

  this.sendPacket("self");
  this.awaitNameChoice().then( name => {
    console.info("Client",this.id,"has chosen name:",name);
    this.name = name;
    return this.awaitRoomChoice();
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
Client.prototype.awaitNameChoice = function(){
  this.send({type:"getName",msg:"Please provide a name"});
  return this.after("name").then(function(resp){
    var name = resp.name;
    if(name === undefined){
      this.send({type:"getName",msg:name + " is not a valid name"});
      return this.after("name");
    } else {
      this.name = name;
      return name;
    }
  });
};

/*
* Requests a room the client wishes to join
* Returns: A promise which resolves to the chosen room's id or "+NEW" for a new room
*/
Client.prototype.awaitRoomChoice = function(){
  var that=this;
  this.sendPacket("rooms");
  return this.after("join").then(function(resp){
    var room;
    if(resp.room == "+NEW"){
      room = that.server.newRoom();
    } else {
      room = that.server.rooms[resp.room];
    }
    if(room === undefined){
      that.send({type:"error",msg:room+" is not a valid room"});
      that.send({type:"rooms",rooms:this.server.rooms});
      return that.after("join");
    } else {
      return room;
    }
  });
};

/*
* Adds the client into the given room
*/
Client.prototype.join = function(room){
  if(this.room !== undefined){
    this.room.removeClient(this);
  }
  this.server.rooms[room.id].addClient(this);
};

Client.prototype.onMessage = function(data){
  data = JSON.parse(data);
  var type = data.type;
  delete data.type;
  if(this.oneHooks[type] !== undefined){
    var tmp = this.oneHooks[type];
    delete this.oneHooks[type];
    tmp(data,this);
  } else if (this.hooks[type] !== undefined){
    this.hooks[type](data,this);
  } else if (this.room !== undefined && this.room.hooks[type] !== undefined){
    this.room.hooks[type](data,this);
  } else if (this.server.hooks[type] !== undefined) {
    this.server.hooks[type](data,this);
  } else {
    console.warn("No handler defined for",this.toJSON(),type);
  }
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
