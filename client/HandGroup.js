/*
    Repersents the players hand, has cards, draws them
*/

(function(){
    var MAX_WIDTH = C.hand.widthInCards*(C.grid.margin+C.grid.cardSize)-C.grid.margin;

    function HandGroup(){
        this.Container_constructor();
        this.setup();
        this.mouseChildren = true;
    }
    var p = createjs.extend(HandGroup,createjs.Container);

    //Events
    function onRollOver(evt){
        var that = evt.currentTarget;
        that.activeCard = Math.floor(evt.localX/MAX_WIDTH*that.children.length);
        that.positionCards();
    }
    function onRollOut(evt){
        evt.currentTarget.activeCard = -1;
        evt.currentTarget.positionCards();
    }

    function dragCard(evt){
        var that = evt.currentTarget,
            card = evt.target,
            playing;
        if (card instanceof PonyCard){
            playing = grid.PLAYING_PONY;
            if (card.effect == "replace"){ //XXX magic-string
                playing = grid.PLAYING_REPLACE;
            }
        } else if (card instanceof HandShipCard){
            playing = grid.PLAYING_SHIP;
        }
        card.x = evt.localX - 75;
        card.y = evt.localY - 75;
        var gridPoint = window.grid.globalToLocal(evt.stageX,evt.stageY),
            playAt = window.grid.getNearestSnapPoint(gridPoint.x,gridPoint.y,playing);
        if (playAt){
            card.cursor = [
                "cell",
                "w-resize",
                "s-resize",
                "e-resize",
                "n-resize"
            ][playAt[2]+1];
        } else {
            card.cursor = "no-drop";
        }

        this.stage.update();
    }

    function dragCardEnd(evt){
        var that = evt.currentTarget,
            card = evt.target,
            ship,
            gridPoint = window.grid.globalToLocal(evt.stageX,evt.stageY),
            playing = null;
        card.cursor = "pointer";

        if (evt.localY > 0){
            card.y = 0;
            that.positionCards();
            return;
        }

        //Determin what kind of play this is and find a ship card if needed
        if (card instanceof PonyCard){
            //Find a ship card to use
            ship = that.activeShip;
            for(var i=that.nPonyCards;!ship && i<that.children.length;i++){
                if (that.children[i].effect === ""){
                    ship = that.children[i];
                }
            }
            if(card.effect == "replace"){
                playing = grid.PLAYING_REPLACE;
            } else {
                playing = grid.PLAYING_PONY;
            }
        }  else if (card instanceof HandShipCard){
            playing = grid.PLAYING_SHIP;
        }

        //Find out if the play is valid
        var playAt = grid.getNearestSnapPoint(gridPoint.x,gridPoint.y,playing);
        if (!playAt){
            console.warn("Cannot play there");
            card.y = 0;
            that.positionCards();
            return;
        }

        //Try and make the play
        if (playing == grid.PLAYING_SHIP){
            if (!window.grid.playShip(card,playAt[0],playAt[1],playAt[2])){
                card.y = 0;
                that.positionCards();
                return;
            }
        } else {
            if (!window.grid.playCards(card,ship,playAt[0],playAt[1],playAt[2])){
                card.y = 0;
                that.positionCards();
                return;
            }
        }

        that.positionCards();
    }

    function clickCard(evt){
        var that = evt.currentTarget,
            card = evt.target;
        if (card instanceof HandShipCard){
            if(that.activeShip == card){
                that.activeShip = null;
                card.y = 0;
            } else {
                if (that.activeShip){
                    that.activeShip.y = 0;
                }
                that.activeShip = card;
                card.y = -40;
            }
            if (that.stage){
                that.stage.update();
            }
        }
    }

    p.positionCards = function(){
        var step = (MAX_WIDTH-150)/(this.children.length-1);
        this.children[0].x = 0; //This works nicly if step ends up as Infinity
        for(var i=1;i<this.children.length;i++){
            this.children[i].x = i*step;
        }
        if(this.stage){
            this.stage.update();
        }
    };

    p.setup = function(){
        this.nPonyCards = 0;
        this.activeShip = null;
        this.cards = [];
        this.on("mouseover",onRollOver);
        this.on("rollout",onRollOut);
        this.on("pressmove",dragCard);
        this.on("pressup",dragCardEnd);
        this.on("click",clickCard);
    };

    p.addCard = function(card){
        if (card instanceof PonyCard){
            this.addChildAt(card,this.nPonyCards);
            this.nPonyCards ++;
        } else if (card instanceof HandShipCard){
            this.addChild(card);
        } else {
            throw "Bad card type";
        }
        card.y = 0;

        this.positionCards();
    };
    p.addCards = function(cards){
        for(var i=0;i<cards.length;i++){
            this.addCard(cards[i]);
        }
    };

    p.removeCard = function(card){
        if (!this.removeChild(card)){
            return false;
        }
        if (card instanceof PonyCard){
            this.nPonyCards --;
        }
        if (card == this.activeShip){
            this.activeShip = null;
        }
    };

    window.HandGroup = createjs.promote(HandGroup, "Container");
})();
