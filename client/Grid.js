/*
    Repersents the shipping grid.
*/

(function(){
    function Grid(){
        this.Container_constructor();
        this.setup();
        this.mouseChildren = false;
        this.dragOffX = null;
        this.dragOffY = null;
    }
    var p = createjs.extend(Grid,createjs.Container);

    function gridDrag(evt){
        var that = evt.currentTarget;
        if(evt.target != that) return;
        if(that.dragOffX === null){
            that.dragOffX = evt.localX;
            that.dragOffY = evt.localY;
        }
        that.x = evt.stageX - that.dragOffX;
        that.y = evt.stageY - that.dragOffY;
        that.stage.update();
    }

    function gridDragEnd(evt){
        var that = evt.currentTarget;
        if(evt.target != that) return;
        that.x = evt.stageX - that.dragOffX;
        that.y = evt.stageY - that.dragOffY;
        that.dragOffX = null;
        that.stage.update();
    }

    p.setup = function(){
        this.ponies = {};
        this.ships = {};
        this.on("pressmove",gridDrag);
        this.on("pressup",gridDragEnd);
    };

    p.addPony = function(pony,gx,gy){
        this.ponies[gx+","+gy] = pony;
        pony.x = C.grid.margin+gx*(C.grid.cardSize+C.grid.margin);
        pony.y = C.grid.margin+gy*(C.grid.cardSize+C.grid.margin);
        if(pony.parent){
            pony.parent.removeCard(pony);
        }
        this.addChild(pony);
        if(this.stage){
            this.stage.update();
        }
    };

    p.getWeightedCenterCoords = function(){
        var locs = Object.keys(this.ponies),
            x=0,y=0;
        if (!locs){
            return [0,0];
        }
        for(var i=0;i<locs.length;i++){
            var l = locs[i].split(",");
            x+=l[0]*1;
            y+=l[1]*1;
        }
        x/=locs.length;
        y/=locs.length;
        x = x*(C.grid.cardSize+C.grid.margin)+(C.grid.margin+C.grid.cardSize/2);
        y = y*(C.grid.cardSize+C.grid.margin)+(C.grid.margin+C.grid.cardSize/2);
        return [x,y];
    };

    p.PLAYING_REPLACE = 0;
    p.PLAYING_SHIP = 1;
    p.PLAYING_PONY = 2;

    p.getNearestSnapPoint = function(cx,cy,play_kind){
        var hx = Math.round(2*(cx-C.grid.margin)/(C.grid.cardSize+C.grid.margin)),
            hy = Math.round(2*(cy-C.grid.margin)/(C.grid.cardSize+C.grid.margin)),
            gx = Math.floor(hx/2),
            gy = Math.floor(hy/2),
            d = C.direction.none;

        if (((hx%2) === 0) && ((hy%2) === 0)){
            //Corner of a card
            return null;
        }
        if ((hx%2) && (hy%2)){
            //Center of a card
            if (play_kind != this.PLAYING_REPLACE){
                return null;
            }
            if (this.ponies[gx+","+gy]){
                return [gx,gy,d];
            } else {
                return null;
            }
        }
        //Card Edge
        var ogx = gx,
            ogy = gy;

        if (hy%2){
            //Left Edge
            d = C.direction.left;
            ogx --;
        } else {
            //Top edge
            d = C.direction.up;
            ogy --;
        }
        var tC = this.ponies[gx+","+gy],
            oC = this.ponies[ogx+","+ogy];

        if (tC){
            if (oC){
                //Both spots have a card
                if (play_kind != this.PLAYING_SHIP){
                    return null;
                }
                if (d == C.direction.left){
                    d = C.direction.right;
                } else {
                    d = C.direction.down;
                }
                if (this.ships[ogx+","+ogy+","+d]){
                    return null;
                }
                return [gx,gy,d];
            } else {
                //Other spot is empty, target slot is taken
                //Return other coordinate and opposit
                if (play_kind == this.PLAYING_SHIP){
                    return null;
                }
                if (d==C.direction.left){
                    d = C.direction.right;
                } else {
                    d = C.direction.down;
                }
                return [ogx,ogy,d];
            }
        } else {
            if (oC){
                //Target is free, other taken
                if (play_kind == this.PLAYING_SHIP){
                    return null;
                }
                return [gx,gy,d];
            } else {
                //Both empty
                return null;
            }
        }
    };

    p.removeCard = function(card,checkBreaks){
        if (!this.removeChild(card)){
            return false;
        }
        if (checkBreaks){
            //TODO check grid is still connected
        }
        return true;
    };

    p.addShip = function(ship,gx,gy,d){
        var nShip = new GridShipCard(ship.name,ship.imgSrc,ship.effect);

        if(d == C.direction.left){
            d = C.direction.right;
            gx -= 1;
        } else if(d == C.direction.up){
            d = C.direction.down;
            gy -= 1;
        }
        var x = (gx+1)*(C.grid.margin+C.grid.cardSize),
            y = (gy+1)*(C.grid.margin+C.grid.cardSize);

        if(d == C.direction.right){
            y -= (C.grid.cardSize+C.grid.margin)/2;
        } else if(d == C.direction.down){
            x -= (C.grid.cardSize+C.grid.margin)/2;
        } else {
            throw "Bad Direction";
        }
        this.ships[gx+","+gy+","+d] = nShip;
        this.addChildAt(nShip,0);
        nShip.x = x;
        nShip.y = y;
        ship.parent.removeCard(ship);
    };

    p.playShipCoord = function(pony,ship,gcx,gcy){
        var gx = Math.floor((gcx-C.grid.margin)/(C.grid.cardSize+C.grid.margin)),
            gy = Math.floor((gcy-C.grid.margin)/(C.grid.cardSize+C.grid.margin)),
            mx = (gcx-C.grid.margin)-gx*(C.grid.cardSize+C.grid.margin),
            my = (gcy-C.grid.margin)-gy*(C.grid.cardSize+C.grid.margin),
            d = -1;

        if (mx<my){
            if(mx+my<C.grid.cardSize){
                d = C.direction.left;
            } else {
                d = C.direction.down;
            }
        } else {
            if(mx+my<C.grid.cardSize){
                d = C.direction.up;
            } else {
                d = C.direction.right;
            }
        }
        return this.playShip(ship,gx,gy,d,true);
    };

    p.playShip = function(ship,gx,gy,d,checkNear){
        var ogx = gx, ogy = gy;
        if (d == C.direction.right){
            ogx += 1;
        } else if(d == C.direction.left){
            ogx -= 1;
        } else if(d == C.direction.up){
            ogy -= 1;
        } else if(d == C.direction.down){
            ogy += 1;
        } else {
            throw "Bad Direction";
        }
        if (!this.ponies[ogx+","+ogy]){
            console.warn("No card to attach to found");
            return false;
        }
        if (checkNear && !this.ponies[gx+","+gy]){
            console.warn("Not between 2 cards");
            return false;
        }
        this.addShip(ship,gx,gy,d);
        return true;
    };

    p.playCards = function(pony,ship,gx,gy,d){
        if (d == C.direction.none){
            return this.playReplace(pony,gx,gy);
        }
        if (this.ponies[gx+","+gy]){
            console.warn("Card already present");
            return false;
        }
        if (ship === null){
            console.warn("No ship card selected");
            return false;
        }
        if (!this.playShip(ship,gx,gy,d,false)){
            return false;
        }
        this.addPony(pony,gx,gy);
        return true;
    };

    p.playReplace = function(pony,gx,gy){
        var rm = this.ponies[gx+","+gy];
        if (!rm){
            console.warn("No Card there to replace");
            return false;
        }
        if (rm instanceof StartCard){
            console.warn("Cannot replace start card");
            return false;
        }
        this.removeCard(this.ponies[gx+","+gy]);
        this.addPony(pony,gx,gy);
        return true;
    };

    window.Grid = createjs.promote(Grid, "Container");
})();
