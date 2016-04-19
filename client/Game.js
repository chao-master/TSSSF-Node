function Game(canvas){
  this.canvas = canvas;
  this.children = {};
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
  child.obj.parent = this;
  child.obj.update = this.render.bind(this);
};

function Child(obj,x,y,width,height){
  this.obj = obj;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Child.prototype.render = function(ctx){
  ctx.save();
  ctx.translate(this.x,this.y);
  ctx.beginPath();
  ctx.rect(0,0,this.width,this.height);
  ctx.clip();
  this.obj.render(ctx);
  ctx.restore();
};
