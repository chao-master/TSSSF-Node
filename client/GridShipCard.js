/*
    Repersents the Ship Cards when on the grid
*/

(function(){
    function GridShipCard(name,imgSrc,effect){
        this.Container_constructor();
        this.name = name;
        this.imgSrc = imgSrc;
        this.effect = effect;
        this.setup();
        this.mouseChildren = false;
    }
    var p = createjs.extend(GridShipCard,createjs.Container);

    var bgGraphic = new createjs.Graphics(),
        size = C.grid.cardSize/2;
    bgGraphic.beginFill(C.colours.cards.ship).drawRect(-size/2,-size/2,size,size);

    p.setup = function(){
        var bg = new createjs.Shape(bgGraphic);
        this.addChild(bg);
    };

    window.GridShipCard = createjs.promote(GridShipCard, "Container");
})();
