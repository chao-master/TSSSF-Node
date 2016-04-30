Hand.prototype.on = function(x,y,eventType,event){
  var gap = (this.parent.canvas.width-150)/(this.ponies.length+this.ships.length),
      cardX = Math.floor(x/gap),
      card,types;
  if(cardX >= this.ponies.length){
    cardX -= this.ponies.length;
    if(cardX >= this.ships.length){
      cardX = this.ships.length-1;
    }
    card = this.ships[cardX];
    types = ["ship"];
  } else {
    card = this.ponies[cardX];
    if(card.effect == "replace"){
      types = ["pony","replace"];
    } else {
      types = ["pony"];
    }
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
    this.parent.DRAG_DATA = {
      types:types,
      card:card
    };
  }
};
