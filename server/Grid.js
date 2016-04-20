function Grid(){
  this.ponies = {};
  this.ships = {};
}

Grid.prototype.addPony = function(gridX,gridY,pony){
  var coord = [gridX,gridY];
  if (coord in this.ponies) throw "Pony already at position";
  if (pony.parent === this) throw "Pony already on grid";
  if (pony.parent !== undefined){
    pony.parent.removePony(pony);
  }
  this.ponies[[gridX,gridY]] = pony;
  pony.position = [gridX,gridY];
  pony.parent = this;
};

Grid.prototype.getPony = function(gridX,gridY){
  return this.ponies[[gridX,gridY]];
};

Grid.prototype.removePony = function(gridX,gridY){
  var pony = this.getPony(gridX,gridY);
  if (pony === undefined){
    throw "No pony to remove";
  }
  pony.parent = undefined;
  var that=this;
  delete this.ponies[[gridX,gridY]];
  var rtn = ["up","down","left","right"].map(function(dir){
    return that.removeShip(gridX,gridY,dir);
  }).filter(function(n){return n!==undefined;});
  rtn.push(pony);
  return rtn;
};

Grid.prototype.normalizeShipCoord = function(gridX,gridY,direction){
  if (direction == "up"){
    gridY--;
    direction = "down";
  } else if (direction == "left") {
    direction = "right";
    gridX--;
  }
  return [gridX,gridY,direction];
};

Grid.prototype.addShip = function(gridX,gridY,direction,ship){
  var coord = this.normalizeShipCoord(gridX,gridY,direction);
  if (coord in this.ships) throw "Ship already at position";
  if (ship.parent === this) throw "Ship already on grid";
  if (ship.parent !== undefined){
    ship.parent.removeShip(ship);
  }
  this.ships[coord] = ship;
  ship.position = coord;
  ship.parent = this;
};

Grid.prototype.getShip = function(gridX,gridY,direction){
  var coord = this.normalizeShipCoord(gridX,gridY,direction).join(",");
  return this.ships[coord];
};

Grid.prototype.removeShip = function(gridX,gridY,direction){
  var coord = this.normalizeShipCoord(gridX,gridY,direction),
      ship = this.ships[coord];
  if(ship === undefined) throw "No ship at position to remove";
  ship.parent = undefined;
  delete this.ships[coord];
  return ship;
};

module.exports = Grid;
