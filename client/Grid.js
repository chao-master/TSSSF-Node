function Grid(canvas){
  this.ponies = {};
  this.ships = {};
  this.canvas = canvas;

  this.canvas.oncontextmenu = e => {
    var gridCoords = Grid.prototype.mouseToGridCoords(e.offsetX,e.offsetY),
        card = this.getPony(gridCoords[0],gridCoords[1]);
    var modal = document.createElement("pre");
    modal.style.whiteSpace = "pre-wrap"
    modal.textContent = card.constructor.name+" "+JSON.stringify(
      card,
      ["name","gender","race","extraIcon","effect","condition","score"],
      1
    );
    modal.onclick = function(){
      removeModal(modal);
    };
    addModal(modal);
    return false;
  };
}

Grid.prototype.CELL_MARGIN = 20;
Grid.prototype.CELL_SIZE = 150;

Grid.prototype.addPony = function(gridX,gridY,pony){
  this.ponies[gridX+","+gridY] = pony;
  pony.position = [gridX,gridY];
  pony.parent = this;
};

Grid.prototype.getPony = function(gridX,gridY){
  return this.ponies[gridX+","+gridY];
};

Grid.prototype.render = function(){
  var keys = Object.keys(this.ponies);
  for(var i=0;i<keys.length;i++){
    var pony = this.ponies[keys[i]];
    pony.render();
  }
};

Grid.prototype.mouseToGridCoords = function(mouseX,mouseY,float){
  var gridX = mouseX/(this.CELL_MARGIN+this.CELL_SIZE),
      gridY = mouseY/(this.CELL_MARGIN+this.CELL_SIZE),
      gridXPart,gridYPart;

  if(!float || float == "sperate" || float == "direction"){
    gridXPart = gridX%1;
    gridYPart = gridY%1;
    gridX = Math.floor(gridX);
    gridY = Math.floor(gridY);
  }
  if (float == "seperate"){
    return [gridX,gridY,gridXPart,gridYPart];
  } else if (float == "direction"){
    var dOptions = gridXPart > gridYPart? ["up","right"]:["left","down"],
        direction = gridXPart+gridYPart < 1? dOptions[0]:dOptions[1];
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
      actions.push({type:"pony", gridX:gridNegiX, gridY:gridNegiY, direction:iDirection});
    }
  } else {
    if(targetNegiPony !== undefined){
      actions.push({type:"pony", gridX:gridX, gridY:gridY, direction:direction});
    }
  }
  return actions;
};
