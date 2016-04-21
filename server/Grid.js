/*jshint esnext:true*/
var Grid  = require("../shared/Grid");
module.exports = Grid;

/**
 * Swaps several cards around on the grid
 * @param  {[Cardish]} cards The cards to swap
 * @return {[Card]}          The Swapped Cards
 */
Grid.prototype.swapCards = function(cards){
  cards = cards.map(this.resolveCardish.bind(this));
  var positions = cards.map(function(c){return c.position;});
  positions.push(positions.shift()); //Rotate the array 1 to the left
  cards.forEach(this.removeCard.bind(this)); //Remove all cards
  cards.forEach((c,n)=>this.addCard(positions[n],c)); //Add to new locations
  return cards;
};
