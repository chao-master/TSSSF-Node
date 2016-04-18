/*
    Repersents A medium sized card
    Contains the name, and image along with a static bg colour
    Also adds the update convience method.
*/

(function(){
    var IMAGE_RATIO = 130/96;

    var IMAGE_WIDTH = C.grid.cardSize-20,
        IMAGE_HEIGHT = IMAGE_WIDTH/IMAGE_RATIO;

    function MediumCard(name,imgSrc){
        this.Container_constructor();
        this.name = name;
        this.imgSrc = imgSrc;
        this.mouseChildren = false;
    }

    var p = createjs.extend(MediumCard,createjs.Container);

    //Static Variabled
    p.backgroundColour = "lime";

    p.update = function(){
        if (this.stage){
            this.stage.update();
        }
    };

    p.setup = function(){
        var bg = new createjs.Shape();
        bg.graphics.beginFill(this.backgroundColour).drawRect(0,0,C.grid.cardSize,C.grid.cardSize);
        bg.graphics.beginFill("white").drawRect(10,(C.grid.cardSize-IMAGE_HEIGHT)/2,IMAGE_WIDTH,IMAGE_HEIGHT);
        this.addChild(bg);

        var i = new Image();
        i.src = this.imgSrc;
        var image = new createjs.Bitmap();
        image.x = 10;
        image.y = (C.grid.cardSize-IMAGE_HEIGHT)/2;
        this.addChild(image);

        var that = this;
        i.onload = function(){
            image.image = i;
            var cw = i.width,
                    ch = i.height,
                    cx = 0, cy = 0, s = 1;
            if (cw/ch > IMAGE_RATIO){
                cw = Math.round(i.height * IMAGE_RATIO);
                cx = Math.round((i.width-cw)/2);
                s = IMAGE_HEIGHT/ch;
            } else {
                ch = Math.round(i.width / IMAGE_RATIO);
                cy = Math.round((i.height-ch)/2);
                s = IMAGE_WIDTH/cw;
            }
            image.sourceRect = new createjs.Rectangle(cx,cy,cw,ch);
            image.scaleX = s;
            image.scaleY = s;
            that.update();
        };
    };

    window.MediumCard = createjs.promote(MediumCard, "Container");
})();
