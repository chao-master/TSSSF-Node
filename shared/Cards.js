if(typeof(window) == "undefined"){
  var Grid = require("../server/Grid");
}

function Card(name,imgSrc){
  this.name = name;
  this.imgSrc = imgSrc;
  if(this.loadImage){
    this.loadImage();
  }
}

Card.fromObject = function(obj){
  var card;
  if("gender" in obj || "race" in obj || "icon" in obj){
    card = new PonyCard(obj.name,obj.imgSrc,obj.gender,obj.race,obj.icon,obj.effect);
  } else if("condition" in obj){
    card = new GoalCard(obj.name,obj.imgSrc,obj.condition,obj.score,obj.conditionLogic);
  } else {
    card = new ShipCard(obj.name,obj.imgSrc,obj.gender,obj.race,obj.icon,obj.effect);
  }
  if("id" in obj){
    card.id = obj.id;
  }
  return card;
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

PonyCard.prototype.getAttachedShips = function(){
  if(!(this.parent instanceof Grid)){
    throw "Pony card is not on grid";
  }
  var that=this;
  return ["down","up","left","right"].map(function(d){
    var c = that.position.slice().push(d),
        nc = that.parent.normalizeShipCoord(c);
    return that.parent.getCard(nc);
  }).filter(function(c){return c !== undefined;});
};

function GoalCard(name,imgSrc,condition,score,goalCondition){
  Card.call(this,name,imgSrc);
  this.condition = condition;
  this.score = score;
  this.goalCondition = goalCondition;
}
GoalCard.prototype = Object.create(Card.prototype);
GoalCard.prototype.constructor = GoalCard;

function ShipCard(name,imgSrc,effect){
  Card.call(this,name,imgSrc);
  this.effect = effect;
}
ShipCard.prototype = Object.create(Card.prototype);
ShipCard.prototype.constructor = ShipCard;

ShipCard.prototype.getPonies = function(){
  if(!(this.parent instanceof Grid)){
    throw "Ship card is not on grid";
  }
  var p1At = this.position.slice(0,2),
      p2At = this.position.slice(0,2);
  if(this.position[2] == "down"){
    p2At[1]++;
  } else {
    p2At[0]++;
  }
  return [this.parent.resolveCardish(p1At),this.parent.resolveCardish(p2At)];

};

if(typeof(window) == "undefined"){
  module.exports = {Card,PonyCard,ShipCard,GoalCard};
}
