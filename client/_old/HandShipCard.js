/*
    Repersents the Ship Cards when in a players hand
*/

(function(){
    var IMAGE_RATIO = 130/96;

    var IMAGE_WIDTH = C.grid.cardSize-20,
        IMAGE_HEIGHT = IMAGE_WIDTH/IMAGE_RATIO;



    function HandShipCard(name,imgSrc,effect){
        this.MediumCard_constructor(name,imgSrc);
        this.name = name;
        this.imgSrc = imgSrc;
        this.effect = effect;
        this.setup();
        this.mouseChildren = false;
    }
    var p = createjs.extend(HandShipCard,MediumCard);
    //Static Variables
    p.backgroundColour = C.colours.cards.ship;

    window.HandShipCard = createjs.promote(HandShipCard, "MediumCard");
})();
