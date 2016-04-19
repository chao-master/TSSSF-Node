var CELL_MARGIN = 20,
    CELL_SIZE = 150;

function loadImage(imgSrc){
  return new Promise(function(good,bad){
    var img = new Image();
    img.src = imgSrc;
    img.onload = function(){
      good(img);
    };
    img.onerror = bad;
  });
}

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
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,width,height);
  ctx.drawImage(img,sX,sY,sWidth,sHeight,0,0,width,height);
  return canvas;
}

function Card(name,imgSrc){
  this.name = name;
  this.image = undefined;
  var that = this;
  loadImage(imgSrc)
    .catch(function(e){
      if(imgSrc != "../art/404.jpeg"){
        return loadImage("../art/404.jpeg");
      }
      throw e;
    })
    .then(function(img){
      that.image = resizeImage(img,that.IMG_WIDTH,that.IMG_HEIGHT);
      if(that.parent){
        that.parent.update();
      }
    });
}

Card.prototype.IMG_WIDTH = 130;
Card.prototype.IMG_HEIGHT = 96;
Card.prototype.color = "black";

Card.prototype.fromObject = function(obj){
  if("gender" in obj || "race" in obj || "icon" in obj){
    return new PonyCard(obj.name,obj.image,obj.gender,obj.race,obj.icon,obj.effect);
  } else if("condition" in obj){
    return new GoalCard(obj.name,obj.image,obj.condition,obj.score);
  } else {
    return new ShipCard(obj.name,obj.image,obj.gender,obj.race,obj.icon,obj.effect);
  }
};

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
};

function PonyCard(name,imgSrc,gender,race,extraIcon,effect){
  Card.call(this,name,imgSrc);
  this.gender = gender;
  this.race = race;
  this.effect = effect;
  this.extraIcon = extraIcon;
}

PonyCard.prototype = Object.create(Card.prototype);
PonyCard.prototype.constructor = PonyCard;

PonyCard.prototype.color = "purple";

function GoalCard(name,imgSrc,condition,score){
  Card.call(this,name,imgSrc);
  this.condition = condition;
  this.score = score;
}

GoalCard.prototype = Object.create(Card.prototype);
GoalCard.prototype.constructor = GoalCard;

GoalCard.prototype.color = "blue";

function ShipCard(name,imgSrc,effect){
  Card.call(this,name,imgSrc);
  this.effect = effect;
}

ShipCard.prototype = Object.create(Card.prototype);
ShipCard.prototype.constructor = ShipCard;

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
