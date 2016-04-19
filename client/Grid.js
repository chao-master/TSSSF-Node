function Grid(){
  this.ponies = {};
  this.ships = {};
}

var CELL_MARGIN = 20,
    CELL_SIZE = 150;

Grid.prototype.addPony = function(gridX,gridY,pony){
  var coord = [gridX,gridY];
  if (coord in this.ponies) throw "Pony already at position";
  if (pony.parent === this) throw "Pony already on grid";
  if (pony.parent !== undefined){
    pony.parent.removePony(pony);
  }
  this.ponies[[gridX,gridY]] = pony;
  pony.position = [gridX,gridY];
  pony.parent = this;
};

Grid.prototype.getPony = function(gridX,gridY){
  return this.ponies[[gridX,gridY]];
};

Grid.prototype.removePony = function(gridX,gridY){
  var pony = this.getPony(gridX,gridY);
  if (pony === undefined){
    throw "No pony to remove";
  }
  pony.parent = undefined;
  var that=this;
  delete this.ponies[[gridX,gridY]];
  var rtn = ["up","down","left","right"].map(function(dir){
    return that.removeShip(gridX,gridY,dir);
  }).filter(function(n){return n!==undefined;});
  rtn.push(pony);
  return rtn;
};

Grid.prototype.normalizeShipCoord = function(gridX,gridY,direction){
  if (direction == "up"){
    gridY--;
    direction = "down";
  } else if (direction == "left") {
    direction = "right";
    gridX--;
  }
  return [gridX,gridY,direction];
};

Grid.prototype.addShip = function(gridX,gridY,direction,ship){
  var coord = this.normalizeShipCoord(gridX,gridY,direction);
  if (coord in this.ships) throw "Ship already at position";
  if (ship.parent === this) throw "Pony already on grid";
  if (ship.parent !== undefined){
    ship.parent.removeShip(ship);
  }
  this.ships[coord] = ship;
  ship.position = coord;
  ship.parent = this;
};

Grid.prototype.getShip = function(gridX,gridY,direction){
  var coord = this.normalizeShipCoord(gridX,gridY,direction).join(",");
  return this.ships[coord];
};

Grid.prototype.removeShip = function(gridX,gridY,direction){
  var coord = this.normalizeShipCoord(gridX,gridY,direction),
      ship = this.ships[coord];
  if(ship === undefined) throw "No ship at position to remove";
  ship.parent = undefined;
  delete this.ships[coord];
  return ship;
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
      handler = this["on"+eventType],
      card;
  if(handler === false){
    event.preventDefault();
    return false;
  }
  if(gridCoords.length == 3){
    card = this.getShip.apply(this,gridCoords);
  } else {
    card = this.getPony.apply(this,gridCoords);
  }
  return handler.call(this,card,event);
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
    this.addPony(action.gridX,action.gridY,card);
    this.addShip(action.gridX,action.gridY,action.direction,this.parent.hand.anyShip());
    this.update();
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
      targetPony = this.getPony(gridX,gridY),
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
  targetNegiPony = this.getPony(gridNegiX,gridNegiY);

  if(targetPony !== undefined){
    actions.push({type:"replace",target:targetPony,gridX:gridX,gridY:gridY});
    if(targetNegiPony !== undefined){
      actions.push({type:"ship", gridX:gridX, gridY:gridY, direction:direction});
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
