/*jshint esnext:true*/
var cards = require("../shared/Cards");

cards.Card.prototype.toJSON = function(){
  var rtn = {name:this.name,imgSrc:this.imgSrc,id:this.id};
  ["race","effect","gender","extraIcon","condition","score","effect","special"].forEach(a=>{
    if(a in this) rtn[a] = this[a];
  });
  return rtn;
};

module.exports = cards;
