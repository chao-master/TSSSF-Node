handlers = {};

handlers.self = function(data){
  console.log("Our id is ",data.client.id);
};

handlers.getName = function(data){
  getUserInput(data.msg).then(function(name){
    ws.send({type:"name",name:name});
  });
};

handlers.rooms = function(data){
  var rooms = data.rooms.map(function(n){return {text:n.name,value:n.id};});
  rooms.push({text:"New game",value:"+NEW"});
  getUserSelection("Select Game to join:",rooms).then(function(room){
    ws.send({type:"join",room:room});
  });
};

handlers.clients = function(data){
  var clientList = document.querySelector("#clientList");
  while (clientList.firstChild) {
    clientList.removeChild(clientList.firstChild);
  }
  data.clients.forEach(function(n){
    var li = document.createElement("li");
    li.textContent = n.name;
    clientList.appendChild(li);
  });
};

handlers.join = function(data){
  var li = document.createElement("li");
  li.textContent = data.client.name;
  clientList.appendChild(li);
};
