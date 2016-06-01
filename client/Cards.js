var CELL_MARGIN = 20,
    CELL_SIZE = 150,
    COLORS = {
      male:       "blue",
      female:     "pink",
      malefemale: "gray",
      pegasus:    "blue",
      unicorn:    "green",
      earthpony:  "orange",
      alicorn:    "purple",
      replace:    "#795548",
      swap:       "#9C27B0",
      draw:       "#FF5722",
      newGoal:    "#03A9F4",
      copy:       "#009688",
      special:    "#8BC34A",
      search:     "#FFEB3B"
    };

function resizeImage(img,width,height){
  var ratio = width/height,
      imgRatio = img.width/img.height,
      canvas = document.createElement("canvas"),
      sWidth = img.width,
      sHeight = img.height,
      sX = 0,
      sY = 0;
  canvas.width = width;
  canvas.height = height;
  if (imgRatio > ratio){
    //Image is wider than it needs to be
    sWidth = sHeight*ratio;
    sX = (img.width-sWidth)/2;
  } else {
    //Image is taller than it needs to be
    sHeight = sWidth/ratio;
    sY = (img.height-sHeight)/2;
  }
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img,sX,sY,sWidth,sHeight,0,0,width,height);
  return canvas;
}

//XXX Dirty code to facilitate specials;
Card._fromObject = Card.fromObject;
Card.fromObject = function(obj){
  var specFunc = SpecialCards[obj.special];
  if(specFunc === undefined) return Card._fromObject(obj);
  if("gender" in obj || "race" in obj || "icon" in obj){
    card = new specFunc(obj.name,obj.imgSrc,obj.gender,obj.race,obj.icon,obj.effect);
  } else if("condition" in obj){
    card = new specFunc(obj.name,obj.imgSrc,obj.condition,obj.score);
  } else {
    card = new specFunc(obj.name,obj.imgSrc,obj.gender,obj.race,obj.icon,obj.effect);
  }
  card.id = obj.id;
  return card;
};

Card.prototype.loadImage = function(){
  var that = this;
  new Promise(function(good,bad){
    var img = new Image();
    img.src = that.imgSrc;
    img.onload = function(){
      good(img);
    };
    img.onerror = bad;
  }).catch(function(e){
    var i = Math.floor(Math.random()*7)+1;
    return loadImage("../art2/artmissing0"+i+".png");
  }).then(function(img){
    that.image = resizeImage(img,that.IMG_WIDTH,that.IMG_HEIGHT);
    if(that.parent){
      that.parent.update();
    }
  });
};

Card.prototype.IMG_WIDTH = 130;
Card.prototype.IMG_HEIGHT = 96;
Card.prototype.ICON_SIZE = 25;
Card.prototype.color = "black";

Card.prototype.render = function(ctx,x,y){
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
  if(this.image){
    ctx.drawImage(this.image,canvasX+10,canvasY+10);
  }
  var that = this;
  ["gender","race","effect"].forEach(function(attr,i){
    var col = COLORS[that[attr]];
    if(col === undefined) return;
    ctx.fillStyle = col;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(canvasX+10.5+that.ICON_SIZE*i,canvasY+10.5+that.IMG_HEIGHT,that.ICON_SIZE,that.ICON_SIZE);
    ctx.fill();
    ctx.stroke();
  });
};



ShipCard.prototype.color = "pink";
ShipCard.prototype.render = function(ctx,x,y){
  if(x !== undefined){ //For rendering in hand, we render the grid size version
    if(y===undefined) y=0;
    return Card.prototype.render.call(this,ctx,x,y);
  }
  //Otherwise we render the half grid sized version.
  var cardSize = CELL_SIZE/2,
      cellSize = CELL_SIZE + CELL_MARGIN,
      cellOffset = (cardSize + CELL_MARGIN)/2,
      canvasX = cellSize*this.position[0]+cellOffset,
      canvasY = cellSize*this.position[1]+cellOffset;
      if(this.position[2] == "down"){
        canvasY+=cardSize*1+CELL_MARGIN/2;
      } else if(this.position[2] == "right"){
        canvasX+=cardSize*1+CELL_MARGIN/2;
      }
  ctx.fillStyle = this.color;
  ctx.fillRect(canvasX,canvasY,cardSize,cardSize);
  if(this.image){
    ctx.drawImage(this.image,0,0,this.image.width,this.image.height,canvasX+5,canvasY+13,this.image.width/2,this.image.height/2);
  }
};


PonyCard.prototype.color = "purple";
GoalCard.prototype.color = "blue";
