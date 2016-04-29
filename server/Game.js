/*jshint esnext:true*/
var fs = require("fs"),
    cards = require("./Cards"),
    Grid = require("./Grid"),
    Decks = require("./Decks.js");

/**
 * Represents a game
 * @param {Room} room     The parent Room
 * @param {[String]} cardSets List of card sets to use
 */
function Game(room,cardSets){
  this.room = room;
  this.hands = [];
  this.grid = new Grid(this);
  this.decks = new Decks(this);
  this.cardList = [];
  cardSets.forEach(this.loadCards.bind(this));
  this.setupDecks();

  //---DEMO---
  this.grid.addCard([0,0],this.cardList[0]);
  this.__demo__hand = this.decks.drawCards(4,3);
}

/**
 * Loads a card set from the given file and adds them to the usable card List
 * @param  {String}   file    File location to load the card list from
 */
Game.prototype.loadCards = function(file){
  var that = this;
  JSON.parse(fs.readFileSync(file)).forEach(function(rawCard){
    var card = cards.Card.fromObject(rawCard);
    card.id = that.cardList.length;
    that.cardList.push(card);
  });
};

Game.prototype.setupDecks = function(){
  for(var i=0;i<this.cardList.length;i++){
    this.decks.addCard(i);
  }
  this.decks.shuffleShips();
  this.decks.shuffleGoals();
  this.decks.shufflePonies();
};

/**
 * Event handler to be called when a player plays a cards
 * Calculates all the results of the play then returns what needs to be done
 * @param  {Array}    Cards   List of Card id's and positions that where played
 * @param  {string}   Effect  The name of the effect that has been triggered by the play
 * @param  {[object]} Params  List of paramaters for the triggered effect, varies basied on effect
 * @param  {Client}   Client  The client who made the play
 * @return {Array}            List of Card id's and positions that should be reported back to the client to update their grid
 */
Game.prototype.onPlay = function(cards,params,client){
  if(params.length > 0 && this.cardList[params[0]].effect == "replace"){
    this.grid.replaceCard(params[1],params.shift());
    return [{id:params.shift(),position:null},cards[0]];
  } else {
    cards.forEach(c => this.grid.addCard(c.position,c.id));
    return cards.concat(this.resolveEffect(params,client));
  }
};

Game.prototype.resolveEffect = function(params,client){
  if(params.length === 0){
    console.warn("Empty effect paramaters - this is only normal if no effect triggered");
    return [];
  }
  var effect = this.cardList[params.shift()].effect;
  if(effect in this.effects){
    return this.effects[effect].call(this,params,client);
  } else {
    console.warn("No handler for effect",effect);
    return [];
  }
};
Game.prototype.effects = {
  swap:function(params,client){
    var swappedCards = this.grid.swapCards([params[0],params[1]]);
    return [].concat(
      swappedCards.map(c=>({id:c.id,position:null})), //Mark cards to remove
      swappedCards.map(c=>({id:c.id,position:c.position})) //Readd cards
    );
  },
  draw:function(params,client){
    var type = params.shift(),drawnCards;
    if(type == "pony"){
      drawnCards = this.decks.drawPonies(1);
    } else {
      drawnCards = this.decks.drawShips(1);
    }
    client.send({
      type:"drawCards",
      cards:drawnCards.map(n=>n.id)
    });
    return [];
  },
  copy:Game.prototype.resolveEffect
};

/*Game Packets - Called from Room.packet()*/
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
