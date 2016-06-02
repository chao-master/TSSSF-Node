function inList(item,list){
  //TODO: maybe check if list isn't a list...
  return list.indexOf(item) >= 0;
}

/**
 * A collection of function generating functions to produce filters for cardSize
 * @type {[function]}
 */
var cardFilters = {
  keyword:function(keywords){
    return function(card){
      //WARNING cards still don't have keywords
      return inList(card.keywords,keywords);
    };
  },
  race:function(races){
    return function(card){
      return inList(card.race,races);
    };
  },
  name:function(name){
    //TODO: code in pony names to cards, needed for things like samePonies
  },
  gender:function(genders){
    return function(card){
      return inList(card.race,races);
    };
  },
  extraIcon:function(extraIcons){
    return function(card){
      return inList(card.extraIcon,extraIcons);
    };
  }
};

var groupFilters = {
  samePonies:function(count){
    return function(cards){
      var names = {},
          highCount = 0;
      cards.forEach(function(card){
        if( names[card.ponyName] === undefined){
          names[card.ponyName] = [card];
        } else {
          names[card.ponyName].push(card);
        }
        if(names[card.ponyName].length > highCount){
          highCount = names[card.ponyName].length;
          if(highCount > count){
            return true;
          }
        }
      });
      return false;
    };
  }
};

/*
Goal Logic Type:
  Pony: Refers to 1 or more pony cards
  Ship: Refers to a single pony being shipped with 1 or more cards
  Ship Card: Refers to 1 or more ship cards (as aposed to the ship)
  Chain: Refers to a chain of poneis shipped together

Goal Logic methods:
  Create: Completing the condition in a single play (may already be partly completed)
  Exists: The condition must be true at any ponint, may already be true
  Play: Completing the condition with plays only made this turn
  Destroy: Removing the given pony, breaking up a ship or chain
  Swap: Swapping 2 or more ponies on the grid (each pony counts inivially)
  Modify: You change a pony card's keyword ect, has "from" and "too" instead of "cards"

/* not/Partly implemnted goal cards:
 - Pomf!
 - Friendship is benefits (missing 4 points)
 - Time Travelers Among Us
 - It's Magical: Horns Are Touching
 - It's not evil
 - Needs More Lesbians
 - Quite
 - Shipwrecker
 - Invasive species
 - Go Forth and Multiply
*/
