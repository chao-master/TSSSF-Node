/*jshint esnext:true*/
var Grid  = require("../shared/Grid");
module.exports = Grid;

/**
 * Swaps several cards around on the grid, and alerts the goal completion
 * tracker to the fact it's happened
 * @param  {[Cardish]} cards The cards to swap
 * @return {[Card]}          The Swapped Cards
 */
Grid.prototype.swapCards = function(cards){
  cards = cards.map(this.resolveCardish.bind(this));
  var positions = cards.map(function(c){return c.position;}),
      that = this;
  positions.push(positions.shift()); //Rotate the array 1 to the left

  //Tell the tracker all these ships are being broken up
  cards.forEach(function(card){
    card.getAttachedShips().forEach(function(shipCard){
      this.game.currentGoals.breakupShip(shipCard);
    });
  });


  cards.forEach(function(card){
    that.removeCard(card); //Remove card
    that.parent.markedSwapped(card); //Marked as swapped
  });
  cards.forEach((c,n)=>this.addCard(positions[n],c)); //Add to new locations

  //Tell the tracker all these cards have been Swapped
  this.game.currentGoals.addSwapped();

  //Tell the tracker all these ships are being formed
  cards.forEach(function(card){
    card.getAttachedShips().forEach(function(shipCard){
      this.game.currentGoals.formShip(shipCard);
    });
  });

  return cards;
};
