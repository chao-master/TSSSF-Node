function Card(name,imgSrc){
  this.name = name;
  this.imgSrc = imgSrc;
  if(this.loadImage){
    this.loadImage();
  }
}

Card.fromObject = function(obj){
  if("gender" in obj || "race" in obj || "icon" in obj){
    return new PonyCard(obj.name,obj.imgSrc,obj.gender,obj.race,obj.icon,obj.effect);
  } else if("condition" in obj){
    return new GoalCard(obj.name,obj.imgSrc,obj.condition,obj.score);
  } else {
    return new ShipCard(obj.name,obj.imgSrc,obj.gender,obj.race,obj.icon,obj.effect);
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

function GoalCard(name,imgSrc,condition,score){
  Card.call(this,name,imgSrc);
  this.condition = condition;
  this.score = score;
}
GoalCard.prototype = Object.create(Card.prototype);
GoalCard.prototype.constructor = GoalCard;

function ShipCard(name,imgSrc,effect){
  Card.call(this,name,imgSrc);
  this.effect = effect;
}
ShipCard.prototype = Object.create(Card.prototype);
ShipCard.prototype.constructor = ShipCard;

if(typeof(window) == "undefined"){
  module.exports = {Card,PonyCard,ShipCard,GoalCard};
}
