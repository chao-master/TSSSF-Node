function Game(canvas){
  this.canvas = canvas;
  this.children = {};
  this.cardList = [];

  var that = this;
  ["click","dragstart","dragover","drop"].forEach(function(event){
    that.canvas.addEventListener(event,that.on.bind(that,event));
  });
  that.canvas.draggable = true;
}

Game.prototype.render = function(){
  var ctx = this.canvas.getContext("2d");
  ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  var keys = Object.keys(this.children);
  for(var i=0;i<keys.length;i++){
    this.children[keys[i]].render(ctx);
  }
};

Game.prototype.addAsChild = function(key,obj,x,y,width,height){
  var child =  new Child(obj,x,y,width,height);
  this.children[key] = child;
  if(this[key] === undefined){
    this[key] = obj;
  }
  child.obj.parent = this;
  child.obj.update = this.render.bind(this);
};

Game.prototype.on = function(eventType,event){
  for(var c in this.children){
    var r = this.children[c].on(event.offsetX,event.offsetY,eventType,event);
    if (r !== undefined) return r;
  }
};

function Child(obj,x,y,width,height){
  this.obj = obj;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Child.prototype.on = function(x,y,eventType,event){
  if(this.x > x || x > this.x+this.width ||
    this.y > y || y > this.y+this.height){
      return undefined;
  }
  return this.obj.on(x,y,eventType,event);
};

Child.prototype.render = function(ctx){
  ctx.save();
  ctx.translate(this.x,this.y);
  ctx.beginPath();
  ctx.rect(0,0,this.width,this.height);
  ctx.clip();
  this.obj.render(ctx);
  ctx.restore();
};
