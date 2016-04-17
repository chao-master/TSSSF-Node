/*jshint esnext:true*/
var console = require("../colourConsole");
var Room = require("./room.js");

function addWithRandomKey(group,item,length){
  var key;
  do {
    key = Array(length).fill(0).map(n=>Math.floor(Math.random()*36).toString(36)).join("");
  } while (group[key] !== undefined);
  group[key] = item;
  return key;
}

function server(){
  this.rooms = {};
  this.clients = {};
}

server.prototype.addClient = function(client){
  return addWithRandomKey(this.clients,client,5);
};
server.prototype.addRoom = function(room){
  return addWithRandomKey(this.rooms,room,5);
};
server.prototype.newRoom = function(){
  return new Room(this);
};

/*Server Packets*/
server.prototype.packet = function(packet){
  var rtn = this.packets[packet].call(this);
  rtn.type = packet;
  return rtn;
};

server.prototype.packets =  {
  rooms: function(){
    var rooms = [];
    for(var r in this.rooms){
      rooms.push(this.rooms[r]);
    }
    return {rooms:rooms};
  }
};

module.exports = server;
