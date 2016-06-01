SpecialCards = {};

SpecialCards.Derpy = function(){PonyCard.apply(this,arguments);};
SpecialCards.Derpy.prototype = Object.create(PonyCard.prototype);
SpecialCards.Derpy.prototype.constructor = SpecialCards.Derpy;
SpecialCards.Derpy.prototype.IMG_HEIGHT = 200;
SpecialCards.Derpy.prototype.render = function(ctx,x,y){
  var cardSize = CELL_SIZE,
      cellSize = cardSize + CELL_MARGIN,
      cellOffset = CELL_MARGIN/2,
      canvasX, canvasY;

  if(x === undefined){
    canvasX = cellSize*this.position[0]+cellOffset;
    canvasY = cellSize*this.position[1]+cellOffset;
  } else {
    canvasX = x;
    canvasY = y===undefined?0:y;
  }

  ctx.fillStyle = this.color;
  ctx.fillRect(canvasX,canvasY,cardSize,cardSize);

  //Change: icons are draw before the image, and at the correctly locaition
  var that = this,
      iconTop = PonyCard.prototype.IMG_HEIGHT+canvasY+10.5;
  ["gender","race","effect"].forEach(function(attr,i){
    var col = COLORS[that[attr]];
    if(col === undefined) return;
    ctx.fillStyle = col;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(canvasX+10.5+that.ICON_SIZE*i,iconTop,that.ICON_SIZE,that.ICON_SIZE);
    ctx.fill();
    ctx.stroke();
  });

  if(this.image){
    ctx.drawImage(this.image,canvasX+10,canvasY+10);
  }
};
