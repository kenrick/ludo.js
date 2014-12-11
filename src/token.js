var constants = require('./constants');
var Grid = constants.Grid;
var ActionTypes = constants.ActionTypes;
var utils = require('./utils');

function Token(options) {
  this.player = options.player;
  this.game   = this.player.game;
  this.team   = options.team;
  this.id     = options.id;
  this.active = false;
  this.cords  = {x: 0, y: 0};
}

Token.prototype.getPossibleActions = function(rolled) {
  var actions = [];

  if(this.active) {
    actions.push({type: ActionTypes.MOVE_BY, token: this, rolled: rolled});
  }
  else {
    if(rolled === 6) {
      actions.push({type: ActionTypes.BORN, token: this, rolled: rolled});
    }
  }

  return actions;
};

Token.prototype.executeAction = function(action) {

  switch (action.type) {
  case ActionTypes.BORN:
      this.born();
    break;

  case ActionTypes.MOVE_BY:
    this.moveBy(action.rolled);
    break;
  }
};

Token.prototype.born = function() {
  var startPoint = Grid.startPoint[this.team];
  this.active = true;
  this.game.actuator.handleTokenBorn(this);

  this.moveTo({x: startPoint[0], y: startPoint[1]});
};

Token.prototype.moveBy = function(rolled) {
  cordArray = [this.cords.x, this.cords.y];
  index = utils.findCordsInArray(cordArray, Grid.path);
  index += rolled;
  if(index > (Grid.path.length - 1) ) {
    index -= (Grid.path.length);
  }
  newCord = Grid.path[index];
  this.moveTo({x: newCord[0], y: newCord[1]});
};


Token.prototype.moveTo = function(cords) {
  this.cords = cords;
  this.game.actuator.handleTokenMoveTo(this, this.cords);
};

module.exports = Token;
