/*jshint esnext:true*/
var sharedHand = require("../shared/Hand.js");

function Hand(client,game){
  this.client = client;
  this.game = game;
  sharedHand.call(this);
}

Hand.prototype = Object.create(sharedHand.prototype);
Hand.prototype.constructor = Hand;

module.exports = Hand;

/**
 * Sends one update message to the owner and another to all other players
 * @param  {Object} self   The message to send to the owner
 * @param  {Object} others The message to send to other users
 */
Hand.prototype.sendSpecifics = function(self,others){
  var clients = this.game.room.clients;
  Object.keys(clients).forEach(k=>{
    var client = clients[k];
    client.send(client == this.client? self:others );
  });
};

/**
 * Draws a combination of pony and/or ship cards
 * @param  {Number} pony number of pony cards to draw
 * @param  {Number} ship number of ship cards to draw
 */
Hand.prototype.drawCards = function(pony,ship){
  var drawnCards = this.game.decks.drawCards(pony,ship),
      drawCardIds = drawnCards.map(card=>{
        this.addCard(card);
        return card.id;
      });
  this.sendSpecifics({  //Send the specific message to the client
    type:"drawCards",
    client:this.client.id,
    cards:drawCardIds
  },{
    type:"drawCards",
    client:this.client.id,
    ponyNo:pony,
    shipNo:ship
  });
};
