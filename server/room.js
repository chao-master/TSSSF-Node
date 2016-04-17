/*jshint esnext:true*/
var console = require("../colourConsole");

function Room(server){
  this.server = server;
  this.id = this.server.addRoom(this);

  this.clients = {};
  this.owner = undefined;

  this.name = undefined;
}

Room.prototype.addClient = function(client) {
  if(this.owner === undefined){
    this.owner = client;
  }
  this.clients[client.id] = client;
  this.broadcast({type:"join",client:client,room:this});
  client.send(this.packet("clients"));
  console.info(client.name,"has joined",this.id);
};

Room.prototype.removeClient = function(client) {
  delete this.clients[client.id];
  this.broadcast({type:"leave",client:client,room:this});
  console.info(client.name,"has left",this.id);
  if(this.owner == client){
    var cIds = Object.keys(this.clients);
    if (cIds.length > 0){
      this.owner = this.clients[cIds[0]];
      this.broadcastPacket("owner");
    } else {
      //Room is empty, destory it.
      delete this.server.rooms[this.id];
    }
  }
};

Room.prototype.hooks = {
  chat:function(data,client){
    data.client = client;
    data.type = "chat";
    this.broadcast(data);
  }
};

Room.prototype.broadcast = function(data){
  for(var c in this.clients){
    this.clients[c].send(data);
  }
};
Room.prototype.broadcastPacket = function(packet){
  this.broadcast(this.packet(packet));
};

Room.prototype.toJSON = function(){
  return {
    "type":"room",
    "id":this.id,
    "name":this.name!==undefined? this.name : this.owner.name+"'s room",
    "owner":this.owner
  };
};

/*Room Packets*/
Room.prototype.packet = function(packet){
  if (this.packets[packet] !== undefined){
    var rtn = this.packets[packet].call(this);
    rtn.type = packet;
    rtn.room = this;
    return rtn;
  } else {
    return this.server.packet(packet);
  }
};

Room.prototype.packets =  {
  clients: function(){
    var clients = [];
    for(var r in this.clients){
      clients.push(this.clients[r]);
    }
    return {clients:clients};
  },
  owner: function(){
    return {owner:this.owner};
  }
};

module.exports = Room;
