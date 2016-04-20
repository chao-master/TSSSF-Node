/*jshint esnext:true*/
var fs = require("fs"),
    cards = require("./Card"),
    Grid = require("./Grid");

function Game(room,cardSets){
  this.room = room;
  this.hands = [];
  this.grid = new Grid(this);
  this.cardList = [];
  cardSets.forEach(this.loadCards.bind(this));
  this.grid.addCard([0,0],0); //DEMO
}

Game.prototype.loadCards = function(file){
  var that = this;
  JSON.parse(fs.readFileSync(file)).forEach(function(rawCard){
    var card = cards.Card.fromObject(rawCard);
    card.id = that.cardList.length;
    that.cardList.push(card);
  });
};

Game.prototype.onPlay = function(cards,effect,params,client){
  if(effect == "replace"){
    this.grid.replaceCard(params[0],cards[0].id);
    return [
      {id:params[0],position:null},
      cards[0]
    ];
  } else {
    cards.forEach(c => this.grid.addCard(c.position,c.id));
    return cards;
  }
};

/*Game Packets*/
Game.prototype.packets={};
Game.prototype.packets.cardList = function(){
  return {cardList:this.cardList};
};
Game.prototype.packets.gridState = function(){
  var grid=this.grid;
  return {grid:[].concat(
    Object.keys(grid.ponies).map(function(n){var c=grid.ponies[n];return {id:c.id,position:c.position};}),
    Object.keys(grid.ships).map(function(n){var c=grid.ships[n];return {id:c.id,position:c.position};})
  )};
};

module.exports = Game;
