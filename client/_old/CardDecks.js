/*
    Repersents the Ship Cards when in a players hand
*/

(function(){

    function CardDecks(cards){
        this.Container_constructor();
        this.setup();
        for(var i=0;i<cards.length;i++){
            this.addCard(cards[i],this.RANDOM);
        }
        this.mouseChildren = false;
    }
    var p = createjs.extend(CardDecks,createjs.Container);
    p.BOTTOM = -1;
    p.RANDOM = -2;

    function onClick(evt){
        var that = evt.currentTarget,
            deck;
        if (evt.localY < 0 || evt.localY > C.grid.cardSize/2 || evt.localX < 0){
            return;
        } else if (evt.localX < C.grid.cardSize/3){
            deck = this.pony;
        } else if (evt.localX < 2*C.grid.cardSize/3){
            deck = this.ship;
        } else if (evt.localX < C.grid.cardSize){
            throw "No goals";
        } else {
            return;
        }
        //Demoy code
        window.hand.addCards(this.drawCard(deck,1));
        this.stage.update();
    }

    p.drawCard = function(deck,n){
        if (typeof deck == "string"){
            deck = this[deck];
        }
        return deck.splice(0,n);
    };

    p.setup = function(){
        this.on("click",onClick);
        var squares = new createjs.Shape(),
            width = C.grid.cardSize/3,
            height = C.grid.cardSize/2;
        squares.graphics.beginFill(C.colours.cards.pony).drawRect(0,0,width,height);
        squares.graphics.beginFill(C.colours.cards.ship).drawRect(width,0,width,height);
        squares.graphics.beginFill(C.colours.cards.goal).drawRect(2*width,0,width,height);

        this.addChild(squares);

        this.pony = [];
        this.ship = [];
    };

    p.addCard = function(card,position){
        var deck;
        if (card instanceof PonyCard){
            deck = this.pony;
        } else if (card instanceof HandShipCard){
            deck = this.ship;
        } else {
            throw "Not a card";
        }

        if (position == this.BOTTOM){
            deck.push(card);
        } else {
            if (position == this.RANDOM){
                position = Math.floor(Math.random()*(deck.length+1));
            }
            deck.splice(position,0,card);
        }
    };

    window.CardDecks = createjs.promote(CardDecks, "Container");
})();
