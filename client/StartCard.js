/*
    Repersents the Start Card when on the grid
*/

(function(){
    function StartCard(name,imgSrc,gender,race,time,effect){
        this.PonyCard_constructor(name,imgSrc);
        this.gender = gender;
        this.race = race;
        this.time = time;
        this.effect = effect;
        this.setup();
        this.mouseChildren = false;
    }
    var p = createjs.extend(StartCard,PonyCard);
    p.backgroundColour = C.colours.cards.start;

    window.StartCard = createjs.promote(StartCard, "PonyCard");
})();
