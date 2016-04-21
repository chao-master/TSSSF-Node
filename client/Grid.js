/**
 * Contains Client side Grid Methods, load after shared/Grid.js
 */
var CELL_MARGIN = 20,
    CELL_SIZE = 150;

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

/**
 * Called by Game when a mouse event happens on the grid.
 * @param  {Number} x         X position of the event relative to the grid
 * @param  {Number} y         Y position of the event relative to the grid
 * @param  {String} eventType The event that was triggered
 * @param  {Event} event      Event Object
 * @return {Boolean}          Same return value as used by event handlers
 */
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
  var types = this.parent.DRAG_DATA.types,
      img = this.parent.DRAG_DATA.img,
      actions = this.getActions(event.offsetX,event.offsetY)
        .filter(function(n){return types.indexOf(n.type)>=0;});
  if(actions.length > 0){
    if(actions[0].type == "pony" && this.parent.hand.ships.length === 0){
      //Trying to play a pony without a ship
      return;
    }
    if(actions[0].type == "replace"){
      event.dataTransfer.dropEffect = "copy";
    } else {
      event.dataTransfer.dropEffect = "move";
    }
    event.preventDefault();
  }
};

//Main event handler for playing cards.
Grid.prototype.ondrop = function(x,y,event){
  var types = this.parent.DRAG_DATA.types,
      card = this.parent.DRAG_DATA.card,
      action = this.getActions(x,y).filter(function(n){return types.indexOf(n.type)>=0;})[0];
  event.preventDefault();

  var triggeredCard, playedCards;
  if(action.type == "pony"){
    triggeredCard = card;
    playedCards = [
      {id:card.id,position:[action.gridX,action.gridY]},
      {id:this.parent.hand.anyShip().id,position:[action.gridX,action.gridY,action.direction]},
    ];
  } else if (action.type == "ship"){
    triggeredCard = this.getCard([action.gridX,action.gridY]);
    playedCards = [{id:card.id,position:[action.gridX,action.gridY,action.direction]}];
  } else if (action.type == "replace"){
    triggeredCard = card;
    playedCards = [
      {id:card.id,position:[action.gridX,action.gridY]}
    ];
  }
  if(playedCards === undefined) return;

  //Do effects
  var effect = triggeredCard.effect,
      prom;
  if(effect == "replace" && action.type != "replace"){
    effect = undefined;
  }
  this.doEffect(effect,action).then(function(result){
    ws.send({
      type:"playCards",
      cards:playedCards,
      effect:effect,
      params:result
    });
  });
};

Grid.prototype.doEffect = function(effect,action){
  var that = this;
  switch(effect){
    case "draw":
      return getUserSelection("Select a card to draw",[
        {text:"Pony card",value:"pony"},
        {text:"Ship card",value:"ship"}
      ]).then(function(n){return [n];});
    case "replace":
      return Promise.resolve([action.target.id]);
    case "copy":
      return getCardSelection(
        "Select card to copy",
        function(n){return n.effect && n.effect != "replace" && n.effect != "copy";}
      ).then(function(card){
        return that.doEffect(card.effect).then(function(n){
          n.unshift(card.id);
          return n;
        });
      });
    case "swap":
      var ponyFilter = function(n){return n instanceof PonyCard;};
      return getCardSelection("Select first card to swap",ponyFilter).then(function(card1){
        return getCardSelection("Select card to swap it with",ponyFilter).then(function(card2){
          return [card1.id,card2.id];
        });
      });
    default:
      return Promise.resolve([]);
  }
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
