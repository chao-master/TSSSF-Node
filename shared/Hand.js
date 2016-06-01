function Hand(){
  this.ponies = [];
  this.ships = [];
  this.goals = [];
}

//If running on node export Hand & Import cards
if(typeof(window) == "undefined"){
  module.exports = Hand;
  var cards = require("../server/Cards");
  Card = cards.Card;
  PonyCard = cards.PonyCard;
  ShipCard = cards.ShipCard;
  GoalCard = cards.GoalCard;
}

/**
 * Adds a card to the players hand
 * @param  {Card} card The Pony,Ship or Goal card to addCard
 */
Hand.prototype.addCard = function(card){
  if (card instanceof PonyCard){
    this.ponies.push(card);
    card.parent = this;
  } else if (card instanceof ShipCard){
    this.ships.push(card);
    card.parent = this;
  } else if (card instanceof GoalCard) {
    this.goals.push(card);
    card.parent = this;
  } else {
    console.error(card,"Is neither a Pony or Ship card and hence cannot be added to Hand");
  }
};

/**
 * Removes the given card from the players hand
 * @param  {Card} card The card to remove
 */
Hand.prototype.removeCard = function(card){
  var removeFrom;
  if (card instanceof ShipCard){
    removeFrom = this.ships;
  } else if (card instanceof GoalCard){
    removeFrom = this.goals;
  } else if (card instanceof PonyCard){
    removeFrom = this.ponies;
  } else {
    console.error(card,"Is neither a Pony or Ship card and hence cannot be removed from Hand");
  }
  var rId = removeFrom.indexOf(card);
  if(rId<0){
    console.error("Card ",card,"is not in hand");
  } else {
    removeFrom.splice(rId,1);
  }
};

/**
 * Returns any (read first) ship from the hand
 * @return {ShipCard} The "randomnly" selected card
 */
Hand.prototype.anyShip = function(){
  return this.ships[0];
};
