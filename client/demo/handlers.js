handlers = {};
var ourId;

handlers.self = function(data){
  ourId = data.client.id;
  console.log("Our id is",data.client.id);
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
  if(data.client.id == ourId){
    var roomLink = location.origin+location.pathname+"?room="+data.room.id;
    document.querySelector("#joinLink").textContent = roomLink;
    document.querySelector("#gameRoom").style.display = null;
  }
  var li = document.createElement("li");
  li.textContent = data.client.name;
  document.querySelector("#clientList").appendChild(li);
};

handlers.chat = function(data){
  var li = document.createElement("li");
  li.textContent = data.client.name + ": " + data.msg;
  document.querySelector("#chat ul").appendChild(li);
};

handlers.error = function(data){
  showError("Error: "+data.msg);
};
handlers.cardList = function(data){
  game.cardList = data.cardList.map(Card.fromObject);
};

handlers.drawCards = function(data){
  if(data.client == ourId){
    for(var i=0;i<data.cards.length;i++){
      hand.addCard(game.cardList[data.cards[i]]);
    }
    game.render();
  } else {
    //Other players cards
  }
};

handlers.gridState = function(data){
  data.grid.forEach(function(n){
    game.grid.addCard(n.position,n.id);
  });
  data.goals.forEach(function(n) {
    goals[n] = n.id;
    var card = game.cardList[n.id];
    document.querySelectorAll("#demo-goals div")[n.position].innerHTML = "<strong>"+card.name+" ("+card.score+")</strong></br>"+card.condition;
  });
  game.render();
};

handlers.playCards = function(data){
  data.cards.forEach(function(n){
    if(n.position === null){
      game.grid.removeCard(n.id);
    } else {
      game.grid.addCard(n.position,n.id);
    }
  });
  game.render();
};
