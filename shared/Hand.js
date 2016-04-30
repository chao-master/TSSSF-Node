function Hand(){
  this.ponies = [];
  this.ships = [];
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

Hand.prototype.render = function(ctx){
  var gap = (this.parent.canvas.width-150)/(this.ponies.length+this.ships.length);
  for(var i=0;i<this.ponies.length;i++){
    this.ponies[i].render(ctx,gap*i);
  }
  for(i=0;i<this.ships.length;i++){
    this.ships[i].render(ctx,gap*(i+this.ponies.length));
  }
};

Hand.prototype.addCard = function(card){
  if (card instanceof PonyCard){
    this.ponies.push(card);
    card.parent = this;
  } else if (card instanceof ShipCard){
    this.ships.push(card);
    card.parent = this;
  } else {
    console.error(card,"Is neither a Pony or Ship card and hence cannot be added to Hand");
  }
};

Hand.prototype.removeCard = function(card){
  var removeFrom = card instanceof ShipCard? this.ships:this.ponies,
      rId = removeFrom.indexOf(card);
  if(rId<0){
    console.error("Card ",card,"is not in hand");
  } else {
    removeFrom.splice(rId,1);
  }
};

Hand.prototype.anyShip = function(){
  return this.ships[0];
};
