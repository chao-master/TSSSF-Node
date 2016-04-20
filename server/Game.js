/*jshint esnext:true*/
var fs = require("fs"),
    cards = require("./Card"),
    Grid = require("./Grid");

function Game(room,cardSets){
  this.room = room;
  this.hands = [];
  this.grid = new Grid();
  this.cards = [];
  cardSets.forEach(this.loadCards.bind(this));
  this.grid.addPony(0,0,this.cards[0]); //DEMO
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
Game.prototype.packets.gridState = function(){
  var grid=this.grid;
  return {grid:[].concat(
    Object.keys(grid.ponies).map(function(n){var c=grid.ponies[n];return {id:c.id,position:c.position};}),
    Object.keys(grid.ships).map(function(n){var c=grid.ships[n];return {id:c.id,position:c.position};})
  )};
};

module.exports = Game;
