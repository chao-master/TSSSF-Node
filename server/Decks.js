/*jshint esnext:true*/
var cards = require("./Cards"),
    Grid = require("./Grid");

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function Decks(parent){
  this.parent = parent;
  this.shipCards = [];
  this.ponyCards = [];
  this.goalCards = [];
}

Decks.prototype.drawPonies = function(n){
  n = n === undefined?1:n;
  return this.ponyCards.splice(n);
};

Decks.prototype.drawShips = function(n){
  n = n === undefined?1:n;
  return this.shipCards.splice(n);
};

Decks.prototype.drawGoals = function(n){
  n = n === undefined?1:n;
  return this.goalCards.splice(n);
};

Decks.prototype.resetAll = function(){
  this.shipCards = [];
  this.ponyCards = [];
  this.goalCards = [];
};

Decks.prototype.drawCards = function(ponies,ships){
  return [this.drawPonies(ponies),this.drawShips(ships)];
};

Decks.prototype.addCard = function(cardish){
  var card = this.resolveCardish(cardish);
  if (card instanceof cards.PonyCard){
    this.ponyCards.push(card);
  } else if (card instanceof cards.ShipCard){
    this.shipCards.push(card);
  } else {
    console.warn("Warning:",card,"is neither a pony or ship card");
  }
};

Decks.prototype.shufflePonies = function(){
  shuffle(this.ponyCards);
};

Decks.prototype.shuffleShips = function(){
  shuffle(this.shipCards);
};

Decks.prototype.shuffleGoals = function(){
  shuffle(this.goalCards);
};

Decks.prototype.resolveCardish = function(cardish){
  if(typeof(cardish) == "number"){
    return this.parent.cardList[cardish];
  } else {
    return cardish;
  }
};

module.exports = Decks;
