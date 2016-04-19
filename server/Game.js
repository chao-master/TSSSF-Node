/*jshint esnext:true*/
var fs = require("fs"),
    cards = require("./Card");

function Game(room,cardSets){
  this.room = room;
  this.hands = [];
  this.grid = undefined;
  this.cards = [];
  cardSets.forEach(this.loadCards.bind(this));
}

Game.prototype.loadCards = function(file){
  var that = this;
  JSON.parse(fs.readFileSync(file)).forEach(function(rawCard){
    var card = cards.Card.fromObject(rawCard);
    card.id = that.cards.length;
    that.cards.push(card);
  });
};

/*Game Packets*/
Game.prototype.packets={};
Game.prototype.packets.cardList = function(){
  return {cardList:this.cards};
};

module.exports = Game;
