function Hand(){
  this.ponies = [];
  this.ships = [];
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
