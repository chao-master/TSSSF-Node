/*jshint esnext:true*/
var _Hand = require("../shared/Hand");

function Hand(client){
  this.client = client;
  _Hand.call(this);
}

Hand.prototype = Object.create(_Hand.prototype);
Hand.prototype.constructor = Hand;

module.exports = Hand;
