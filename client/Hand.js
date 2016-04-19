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

Hand.prototype.removePony = function(card){
  this.ponies.splice(this.ponies.indexOf(card),1);
};

Hand.prototype.removeShip = function(card){
  this.ships.splice(this.ships.indexOf(card),1);
};

Hand.prototype.anyShip = function(){
  return this.ships[0];
};

Hand.prototype.on = function(x,y,eventType,event){
  var gap = (this.parent.canvas.width-150)/(this.ponies.length+this.ships.length),
      cardX = Math.floor(x/gap),
      card,type;
  if(cardX >= this.ponies.length){
    cardX -= this.ponies.length;
    if(cardX >= this.ships.length){
      cardX = this.ships.length-1;
    }
    card = this.ships[cardX];
    type = "ship";
  } else {
    card = this.ponies[cardX];
    type = "pony";
  }
  if (eventType == "dragstart"){
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        img = document.createElement("img");
    canvas.width=150;
    canvas.height=150;
    card.render(ctx,0);
    img.src = canvas.toDataURL();
    event.dataTransfer.setDragImage(img, 75, 75);
    this.parent.DRAG_DATA = {type:type,card:card};
  }
};
