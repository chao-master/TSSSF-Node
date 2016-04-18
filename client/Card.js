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
    .catch(function(){
      return loadImage("../art/404.jpeg");
    })
    .then(function(img){
      that.image = resizeImage(img,that.IMG_WIDTH,that.IMG_HEIGHT);
      if(that.parent){
        that.render();
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

Card.prototype.render = function(){
  var cardSize = this.parent.CELL_SIZE,
      cellSize = cardSize + this.parent.CELL_MARGIN,
      cellOffset = this.parent.CELL_MARGIN/2,
      canvasX = cellSize*this.position[0]+cellOffset,
      canvasY = cellSize*this.position[1]+cellOffset,
      ctx = this.parent.canvas.getContext("2d");

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
