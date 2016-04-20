var cards = require("./Card.js");

function Grid(game){
  this.ponies = {};
  this.ships = {};
  this.parent = game;
}

Grid.prototype.addCard = function(coord,card){
  if(typeof(card) == "number"){
    card = this.parent.cardList[card];
  }
  var addTo;
  if (card instanceof cards.ShipCard){
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

Grid.prototype.replaceCard = function(target,card){
  if(Array.isArray(target)){
    target = this.getCard(target);
  }
  if(typeof(target) == "number"){
    target = this.parent.cardList[target];
  }
  if(typeof(card) == "number"){
    card = this.parent.cardList[card];
  }
  if(target.parent !== this){
    console.warn("Target card is not on grid");
  } else if (card.parent === this) {
    console.warn("Card is already on grid");
  } else {
    this.removeCard(target);
    this.addCard(target.position,card);
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
  if(coord instanceof cards.Card){
    coord = coord.position;
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

module.exports = Grid;
