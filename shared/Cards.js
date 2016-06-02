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

if(typeof(window) == "undefined"){
  module.exports = {Card,PonyCard,ShipCard,GoalCard};
}
