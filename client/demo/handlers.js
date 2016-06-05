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

//DEMO
function setGoal(id,card){
  document.querySelectorAll("#demo-goals div")[id].innerHTML = !card ? "None":"<strong>"+card.name+" ("+card.score+")</strong></br>"+card.condition;
  goals[id] = card;
}

handlers.gridState = function(data){
  data.grid.forEach(function(n){
    game.grid.addCard(n.position,n.id);
  });
  data.goals.forEach(function(n) {
    var card = game.cardList[n.id];
    setGoal(n.position,card);
  });
  game.render();
};

handlers.playCards = function(data){
  data.cards.forEach(function(n){
    var card = game.cardList[n.id],
        pos = n.position;
    if (card instanceof GoalCard){
      if(typeof pos == 'string'){
        //Card has been added to someone's hand
        if(pos == ourId){
          hand.addCard(game.cardList[card]);
          showError("Goal "+game.cardList[card].name+" completed [click to dismiss]");
        }
        pos = null; //mark card for removal from list
      }
      if(pos === null){
        var rId = goals.indexOf(card);
        if(rId < 0){
          console.warning("Removing goal not in goal list");
        } else {
          setGoal(rId,null);
        }
      } else {
        setGoal(pos,card);
      }
    } else {
      if(pos === null){
        game.grid.removeCard(card);
      } else {
        game.grid.addCard(pos,card);
      }
    }
  });
  game.render();
};
