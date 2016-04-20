function Grid(){
  this.ponies = {};
  this.ships = {};
}

var CELL_MARGIN = 20,
    CELL_SIZE = 150;

Grid.prototype.addCard = function(coord,card){
  if(typeof(card) == "number"){
    card = this.parent.cardList[card];
  }
  var addTo;
  if (card instanceof ShipCard){
    addTo = this.ships;
    coord = this.normalizeShipCoord(coord);
  } else {
    addTo = this.ponies;
  }
  if(coord in addTo){
    console.warn("Card already at position");
  } else if (card.parent === this){
    console.warn("Card already on grid");
  } else {
    if (card.parent !== undefined){
      card.parent.removeCard(card);
    }
    addTo[coord] = card;
    card.position = coord;
    card.parent = this;
  }
};

Grid.prototype.getCard = function(coord){
  if (coord.length == 3){
    coord = this.normalizeShipCoord(coord);
    return this.ships[coord];
  } else {
    return this.ponies[coord];
  }
};

Grid.prototype.removeCard = function(coord){
  if(coord === undefined) return;
  if(coord instanceof Card){
    coord = gridX.position;
  }
  var removeFrom,card;
  if(coord.length == 3){
    coord = this.normalizeShipCoord(coord);
    removeFrom = this.ships;
  } else {
    removeFrom = this.ponies;
  }
  card = removeFrom[coord];
  if(card === undefined){
    console.warn("No card to remove");
  } else {
    card.parent = undefined;
    delete removeFrom[coord];
    return card;
  }
};

Grid.prototype.normalizeShipCoord = function(gridX,gridY,direction){
  if(Array.isArray(gridX)){
    direction = gridX[2];
    gridY = gridX[1];
    gridX = gridX[0];
  }
  if (direction == "up"){
    gridY--;
    direction = "down";
  } else if (direction == "left") {
    direction = "right";
    gridX--;
  }
  return [gridX,gridY,direction];
};

Grid.prototype.render = function(ctx){
  var keys = Object.keys(this.ships);
  for(var i=0;i<keys.length;i++){
    var ship = this.ships[keys[i]];
    ship.render(ctx);
  }

  keys = Object.keys(this.ponies);
  for(i=0;i<keys.length;i++){
    var pony = this.ponies[keys[i]];
    pony.render(ctx);
  }
};

Grid.prototype.on = function(x,y,eventType,event){
  if(eventType == "drop"){
    return this.ondrop(x,y,event);
  }
  if(eventType == "dragover"){
    return this.ondragover(x,y,event);
  }
  var gridCoords = this.mouseToGridCoords(x,y,"ship"),
      handler = this["on"+eventType];
  if(handler === false){
    event.preventDefault();
    return false;
  }
  return handler.call(this,this.getCard(gridCoords),event);
};

Grid.prototype.onclick = function(card,coords){
  console.log(card,coords);
};

Grid.prototype.ondragover = function(x,y,event){
  var type = this.parent.DRAG_DATA.type,
      img = this.parent.DRAG_DATA.img,
      actions = this.getActions(event.offsetX,event.offsetY)
        .filter(function(n){return n.type == type;});
  if(actions.length > 0){
    if(actions[0].type == "pony" && this.parent.hand.ships.length === 0){
      //Trying to play a pony without a ship
      return;
    }
    event.dataTransfer.dropEffect = "move";
    event.preventDefault();
  }
};

Grid.prototype.ondrop = function(x,y,event){
  var type = this.parent.DRAG_DATA.type,
      card = this.parent.DRAG_DATA.card,
      action = this.getActions(x,y).filter(function(n){return n.type==type;})[0];
  console.log(action);
  if(action.type == "pony"){
    ws.send({ //DEMO - unfinilised
      type:"playCards",
      cards:[
        {id:card.id,position:[action.gridX,action.gridY]},
        {id:this.parent.hand.anyShip().id,position:[action.gridX,action.gridY,action.direction]},
      ]
    });
  } else if (action.type == "ship"){
    ws.send({ //DEMO - unfinilised
      type:"playCards",
      cards:[
        {id:card.id,position:[action.gridX,action.gridY,action.direction]}
      ]
    });
  }
  event.preventDefault();
};

Grid.prototype.ondragstart = false;

Grid.prototype.mouseToGridCoords = function(mouseX,mouseY,float){
  var gridX = mouseX/(CELL_MARGIN+CELL_SIZE),
      gridY = mouseY/(CELL_MARGIN+CELL_SIZE),
      gridXPart,gridYPart;

  if(float !== true){
    gridXPart = gridX%1;
    gridYPart = gridY%1;
    gridX = Math.floor(gridX);
    gridY = Math.floor(gridY);
  }
  if (float == "seperate"){
    return [gridX,gridY,gridXPart,gridYPart];
  } else if (float == "direction" || float == "ship"){
    var dOptions = gridXPart > gridYPart? ["up","right"]:["left","down"],
        direction = gridXPart+gridYPart < 1? dOptions[0]:dOptions[1];
    if(float == "ship"){
      var rMargin = CELL_MARGIN/CELL_SIZE;
      if( gridXPart > rMargin && gridXPart+rMargin < 1 &&
        gridYPart > rMargin && gridYPart+rMargin < 1) {
          return [gridX,gridY];
        }
    }
    return [gridX,gridY,direction];
  }
  return [gridX,gridY];
};

Grid.prototype.getActions = function(mouseX,mouseY){
  var gridCoords = this.mouseToGridCoords(mouseX,mouseY,"direction"),
      gridX = gridCoords[0],
      gridY = gridCoords[1],
      direction = gridCoords[2],
      targetPony = this.getCard([gridX,gridY]),
      gridNegiX = gridX,
      gridNegiY = gridY,
      targetNegiPony,
      iDirection;
      actions = [];
  if (direction == "up"){
    gridNegiY--;
    iDirection = "down";
  } else if (direction == "down"){
    gridNegiY++;
    iDirection = "up";
  } else if (direction == "left"){
    gridNegiX--;
    iDirection = "right";
  } else if (direction == "right"){
    gridNegiX++;
    iDirection = "left";
  }
  targetNegiPony = this.getCard([gridNegiX,gridNegiY]);

  if(targetPony !== undefined){
    actions.push({type:"replace",target:targetPony,gridX:gridX,gridY:gridY});
    if(targetNegiPony !== undefined){
      if(this.getCard([gridX,gridY,direction]) === undefined){
        actions.push({type:"ship", gridX:gridX, gridY:gridY, direction:direction});
      }
    } else {
      actions.push({type:"pony", gridX:gridNegiX, gridY:gridNegiY, direction:iDirection, target:targetPony});
    }
  } else {
    if(targetNegiPony !== undefined){
      actions.push({type:"pony", gridX:gridX, gridY:gridY, direction:direction, target: targetNegiPony});
    }
  }
  return actions;
};
