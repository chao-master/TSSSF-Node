var cards = require("./Card.js");

/**
 * Repersents the Shipping grid, a collection of ponies and ships
 * @param {Game} game The Parent game
 */
function Grid(game){
  this.ponies = {};
  this.ships = {};
  this.parent = game;
}

/**
 * Converts a cardish value into a cardish
 * @param  {Cardish} cardish          The Card object, it's id or it's position
 * @return {Card}                     The card described by the Cardish
 */
Grid.prototype.resolveCardish = function(cardish){
  if(typeof(cardish) == "number"){
    return this.parent.cardList[cardish];
  } else if (Array.isArray(cardish)) {
    return this.getCard(cardish);
  } else {
    return cardish;
  }
};

/**
 * Adds a card to the grid, takes multiple options
 * @param  {Array}    coord    Coordinates to add to in form x,y or x,y,direction
 * @param  {Cardish}  cardish  The Card to add
 */
Grid.prototype.addCard = function(coord,cardish){
  var card = this.resolveCardish(cardish);
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

/**
 * Replaces a card on the grid with another cardList
 * @param  {Cardish} target The Card to be replaced (direct refence or it's id)
 * @param  {Cardish} card   The Card to replace it with (direct or it's id)
 * @return {Card}           The Card that was replaced
 */
Grid.prototype.replaceCard = function(target,card){
  target = this.resolveCardish(target);
  card = this.resolveCardish(card);
  if(target.parent !== this){
    console.warn("Target card is not on grid");
  } else if (card.parent === this) {
    console.warn("Card is already on grid");
  } else {
    var removed = this.removeCard(target);
    this.addCard(target.position,card);
    return removed;
  }
};

/**
 * Returns the card at the given coordinates
 * @param  {Array} coord The coordinates of the card in the form x,y with optional direction for ships
 * @return {Card}        The Card at that position or undefined if there is none
 */
Grid.prototype.getCard = function(coord){
  if (coord.length == 3){
    coord = this.normalizeShipCoord(coord);
    return this.ships[coord];
  } else {
    return this.ponies[coord];
  }
};

/**
 * Removes a card from the grid
 * @param  {Cardish}  cardish  The Card to remove, The Id of the card to remove or The position of the card to remove
 * @return {Card}              The removed Card
 */
Grid.prototype.removeCard = function(cardish){
  var coord = this.resolveCardish(cardish).position;
  if(coord === undefined) return;
  var removeFrom, card;
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

/**
 * Normalizes ship coordinates so the direction is either down or right
 * @param  {Array} coords    The coordinates to be normalized
 * @return {Array}           The normalized coordinates
 */
Grid.prototype.normalizeShipCoord = function(coords){
  direction = coords[2];
  gridY = coords[1];
  gridX = coords[0];
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
