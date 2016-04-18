/*
    Repersents the PonyCards when on the grid
*/

(function(){
    function PonyCard(name,imgSrc,gender,race,time,effect){
        this.MediumCard_constructor(name,imgSrc);
        this.gender = gender;
        this.race = race;
        this.time = time;
        this.effect = effect;
        this.setup();
        this.mouseChildren = false;
    }
    var p = createjs.extend(PonyCard,MediumCard);
    p.backgroundColour = C.colours.cards.pony;


    p.setup = function(){
        this.MediumCard_setup();

        var iconX = 30;
        if (this.gender){
            var i = new createjs.Shape();
            i.graphics.beginFill(C.colours.genders[this.gender]).drawCircle(10,10,10);
            i.x = iconX;
            i.y = 120;
            iconX += 20;
            this.addChild(i);
        }
        if (this.race){
            var i = new createjs.Shape();
            i.graphics.beginFill(C.colours.races[this.race]).drawCircle(10,10,10);
            i.x = iconX;
            i.y = 120;
            iconX += 20;
            this.addChild(i);
        }
        if (this.time){
            var i = new createjs.Shape();
            i.graphics.beginFill(C.colours.hourglass).drawCircle(10,10,10);
            i.x = iconX;
            i.y = 120;
            iconX += 20;
            this.addChild(i);
        }
        if (this.effect){
            var i = new createjs.Shape();
            i.graphics.beginFill(C.colours.effects[this.effect]).drawCircle(10,10,10);
            i.x = C.grid.cardSize-40;
            i.y = 120;
            this.addChild(i);
        }
    };

    window.PonyCard = createjs.promote(PonyCard, "MediumCard");
})();
