/*jshint esnext:true*/
var fs = require("fs"),
    cards = require("./Cards"),
    Grid = require("./Grid"),
    Decks = require("./Decks.js"),
    Hand = require("./Hand.js"),
    goalLogic = require("../shared/GoalLogic.js");

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
  this.currentGoals = new goalLogic.CurrentGoals(this);
  this.cardList = [];
  cardSets.forEach(this.loadCards.bind(this));
  this.setupDecks();

  //---- DEMO ----
  this.currentGoals.replenishGoals();
  this.grid.addCard([0,0],this.cardList[0]);
  for(var i=0;i<this.decks.ponyCards.length;i++){
    if (this.decks.ponyCards[i].id === 0) break;
  }
  this.decks.ponyCards.splice(i,1);
  this.activePlayer = 0;
  //---- END DEMO ----
}

Game.prototype.newClient = function(client){
  var newHand = new Hand(client,this);
  newHand.drawCards(4,3);
  client.curHand = newHand;
  this.hands.push(newHand);
};

Game.prototype.isActivePlayer = function(client){
  return this.hands[this.activePlayer].client == client;
};

/**
 * Loads a card set from the given file and adds them to the usable card List
 * @param  {String}   file    File location to load the card list from
 */
Game.prototype.loadCards = function(file){
  var that = this;
  JSON.parse(fs.readFileSync(file)).forEach(function(rawCard){
    var card = cards.Card.fromObject(rawCard);
    card.id = that.cardList.length;
    if("special" in rawCard){ //XXX Special hack
      card.special = rawCard.special;
    }
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

  //XXX Should be tidied up, im thinking an assert statment, that might be helpful
  var cc = this.hands[this.activePlayer].client;
  if(cc != client){
    client.send({type:"error",msg:"Not your turn, it is "+cc.name+" turn"});
    return;
  }

  var response;

  if(params.length > 0 && this.cardList[params[0]].effect == "replace"){
    this.grid.replaceCard(params[1],params.shift());
    response = [{id:params.shift(),position:null},cards[0]];
  } else {
    cards.forEach(c => this.grid.addCard(c.position,c.id));
    response =  cards.concat(this.resolveEffect(params,client));
  }

  //TODO Add the cards played to the tracked goals and then check for checkForCompletion
  var that = this;
  cards.forEach(function(c){
    that.currentGoals.cardPlayed(that.cardList[c.id]);
  });
  console.debug(this.currentGoals.checkForCompletion(0));
  console.debug(this.currentGoals.checkForCompletion(1));
  console.debug(this.currentGoals.checkForCompletion(2));
  return response;
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
    var type = params.shift(),drawnCards,
        nPonies = type=="pony"? 1:0;
    client.curHand.drawCards(nPonies,1-nPonies);
    return [];
  },
  copy:Game.prototype.resolveEffect,
  newGoal:function(params,client){
    var oldGoal = this.decks.resolveCardish(params.shift()),
        newGoalInfo = this.currentGoals.replaceGoal(oldGoal);
    return [{id:oldGoal.id,position:null},newGoalInfo];
  }
};

/*Game hooks, checked after room */
Game.prototype.hooks = {};

Game.prototype.hooks.playCards = function(data,client){
  data.cards = this.onPlay(data.cards,data.params,client);
  data.client = client;
  data.type = "playCards";
  this.room.broadcast(data);
};

Game.prototype.hooks.reSyncGrid = function(data,client){
  client.send(this.room.packet("gridState"));
};

Game.prototype.hooks.endTurn = function(data,client){
  if (!this.isActivePlayer(client)){
    client.send({type:"error",msg:"Not your turn, it is "+cc.name+" turn"});
    return;
  }
  var cHand = client.curHand,
    handSizeNow = cHand.ponies.length + cHand.ships.length,
    handSizeAfter = handSizeNow + data.ponies + data.ships;
  if( handSizeAfter != 7){ //MAGIC Number
    client.send({type:"error",msg:"Attempt to draw wrong number of cards"});
    return;
  }
  client.curHand.drawCards(data.ponies, data.ships);
  this.currentGoals.replenishGoals(); //TODO Currently replenished goals aren't told to players
  this.activePlayer = (this.activePlayer+1)%this.hands.length;
  //TODO Add turnStart message
  this.currentGoals.onTurnBegin();
};

/*Game Packets - Called from Room.packet()*/
Game.prototype.packets = {};
Game.prototype.packets.cardList = function(){
  return {cardList:this.cardList};
};
Game.prototype.packets.gridState = function(){
  var grid=this.grid;
  return {
    grid:[].concat(
      Object.keys(grid.ponies).map(function(n){var c=grid.ponies[n];return {id:c.id,position:c.position};}),
      Object.keys(grid.ships).map(function(n){var c=grid.ships[n];return {id:c.id,position:c.position};})
    ),goals:this.currentGoals.currentGoals.map(function(c,n){return {id:c.id,position:n};}) //XXX Move this line to CurrentGoals obj?
  };
};

module.exports = Game;
