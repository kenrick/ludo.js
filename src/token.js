var constants = require('./constants');
var Grid = constants.Grid;
var ActionTypes = constants.ActionTypes;
var Events = constants.Events;
var utils = require('./utils');

function Token(options) {
  this.player = options.player;
  this.id     = options.id;
  this.game   = this.player.game;
  this.team   = this.player.team;

  this.active = false;
  this.inBlockade = false;
  this.cords  = {x: 0, y: 0};
}

Token.prototype.getPossibleActions = function getPossibleActions(rolled) {
  var actions = [];
  var forecast;
  var enemyToken;
  var allToken;

  if (this.active) {
    forecast = this._forecastCords(rolled);
    enemyToken = this.player.enemyTokenAt(forecast);
    allyTokens = this.player.allyTokensAt(forecast, this);

    if (enemyToken) {
      actions.push({
        type: ActionTypes.KILL_MOVE,
        token: this,
        rolled: rolled,
        enemyToken: enemyToken,
        forecast: forecast
      });
    } else if (allyTokens) {
      actions.push({
        type: ActionTypes.CREATE_BLOCKADE,
        token: this,
        rolled: rolled,
        allyTokens: allyTokens,
        forecast: forecast
      });
    } else {
      actions.push({
        type: ActionTypes.MOVE_BY,
        token: this,
        rolled: rolled,
        forecast: forecast
      });
    }
  }
  else {
    if (rolled === 6) {
      actions.push({type: ActionTypes.BORN, token: this, rolled: rolled});
    }
  }

  return actions;
};

Token.prototype.executeAction = function executeAction(action) {

  switch (action.type) {
  case ActionTypes.BORN:
    this.born();
    break;

  case ActionTypes.MOVE_BY:
    this.moveTo({x: action.forecast[0], y: action.forecast[1]});
    break;

  case ActionTypes.CREATE_BLOCKADE:
    this.moveTo({x: action.forecast[0], y: action.forecast[1]});
    this.createBlockade(action.forecast, action.allyTokens);
    break;

  case ActionTypes.KILL_MOVE:
    this.kill(action.enemyToken);
    this.moveTo({x: action.forecast[0], y: action.forecast[1]});
    break;
  }
};

Token.prototype.born = function born() {
  var startPoint = Grid.startPoint[this.team];
  this.active = true;
  this.game.emit(Events.TOKEN_BORN, { token: this });

  this.moveTo({x: startPoint[0], y: startPoint[1]});
};

Token.prototype._forecastCords = function _forecastCords(rolled) {
  var cordArray = [this.cords.x, this.cords.y];
  var index = utils.findCordsInArray(cordArray, Grid.path);
  index += rolled;
  if (index > (Grid.path.length - 1)) {
    index -= (Grid.path.length);
  }
  return Grid.path[index];
};

Token.prototype.createBlockade = function createBlockade(cords, allytokens) {
  allytokens.push(this);
  this.player.registerBlockade(cords, allytokens);
  this.game.emit(Events.TOKEN_BLOCKADE, { tokens: allytokens, cords: cords });
};

//TODO: Remove this function no longer in use
Token.prototype.moveBy = function moveBy(rolled) {
  var newCord = this._forecastCords(rolled);
  this.moveTo({x: newCord[0], y: newCord[1]});
};

Token.prototype.moveTo = function moveTo(cords) {
  var allyTokens;

  if (this.inBlockade) {
    this.inBlockade = false;
    allyTokens = this.player.allyTokensAt([this.cords.x, this.cords.y], this);
    this.player.registerBlockade(cords, allyTokens);
  }

  this.cords.x = cords.x;
  this.cords.y = cords.y;
  this.game.emit(Events.TOKEN_MOVE_TO, { token: this, cords: this.cords});
};

Token.prototype.killedBy = function killedBy(otherToken) {
  this.active = false;
  this.cords = { x: 0, y: 0 };
};

Token.prototype.kill = function kill(killedToken) {
  killedToken.killedBy(this);
  this.game.emit(Events.TOKEN_KILLED, { killed: killedToken, by: this });
};

module.exports = Token;
