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
  this.isOnHeavenPath = false;
  this.inBlockade = false;
  this.cords  = {x: 0, y: 0};
  this.ascended = false;
}

exports.Token = Token;

Token.build = function build(tokenState, player) {
  var token = new Token({ player: player, id: tokenState.id });

  if (tokenState.active) {
    token.born();
    token.moveTo(tokenState.cords);
  }

  return token;
};

Token.prototype.attributes = function attributes() {
  return {
    id: this.id,
    team: this.team,
    active: this.active,
    isOnHeavenPath: this.isOnHeavenPath,
    inBlockade: this.inBlockade,
    cords: this.cords,
    ascended: this.ascended
  };
};

Token.prototype.atCords = function atCords(cords) {
  return [this.cords.x, this.cords.y].toString() === cords.toString();
};

Token.prototype.getPossibleAction = function getPossibleAction(rolled) {
  var _this = this;
  var action = {};
  var forecast;
  var enemyToken;
  var allyToken;
  var blockadeAhead;
  var overShootAscendingPoint;
  var willAscend;

  forecast = this._forecastCords(rolled);
  blockadeAhead = this._blockadeAhead(rolled);
  overShootAscendingPoint = this._willOverShootAscendingPoint(rolled);

  if (!blockadeAhead && !overShootAscendingPoint && !this.ascended) {
    action.forecast = forecast;
    action.token = this.attributes();
    action.rolled = rolled;

    if (this.active) {
      enemyToken = this.player.enemyTokenAt(forecast);
      allyTokens = this.player.allyTokensAt(forecast, this);
      willAscend = this._willAscend(forecast);

      if (willAscend) {
        action.type = ActionTypes.ASCEND;
      } else if (enemyToken) {
        action.type = ActionTypes.KILL_MOVE;
        action.enemyToken = enemyToken.attributes();
      } else if (allyTokens) {
        action.type = ActionTypes.CREATE_BLOCKADE;
        action.allyTokens = allyTokens.map(function(token) {
          return token.attributes();
        });
      } else {
        action.type = ActionTypes.MOVE_BY;
      }
    } else if (rolled === 6) {
      action.type = ActionTypes.BORN;
    }

    if (action.type) {
      action.take = function() {
        if (!this.dice.used) {
          _this.registerAction(this, this.dice);
          if (_this.game.sync && !_this.game.isServer) {
            _this.game.sync.takeAction(this, this.dice);
          }
        }
        return true;
      };

      return action;
    }
  }

  return false;
};

Token.prototype.registerAction = function registerAction(action, dice) {
  this.executeAction(action);
  this.player.useDice(dice);
};

Token.prototype.executeAction = function executeAction(action) {

  switch (action.type) {
  case ActionTypes.BORN:
    this.born();
    break;

  case ActionTypes.MOVE_BY:
  case ActionTypes.CREATE_BLOCKADE:
  case ActionTypes.KILL_MOVE:
  case ActionTypes.ASCEND:
    this.moveTo({x: action.forecast[0], y: action.forecast[1]});
    break;
  }
};

Token.prototype.born = function born() {
  var startPoint = Grid.startPoint[this.team];
  this.active = true;
  this.game.pushEvent(Events.TOKEN_BORN, { token: this.attributes() });

  this.moveTo({x: startPoint[0], y: startPoint[1]});
};

Token.prototype._forecastCords = function _forecastCords(rolled) {
  var cordArray = [this.cords.x, this.cords.y];
  var cordsAhead = this._findAllCordsAhead(rolled);
  var path = Grid.path;
  var switchToHeaven;
  var index;
  var cords;

  if (this.active) {
    switchToHeaven = utils.findCordsInArray(Grid.switchPoint[this.team], cordsAhead);

    if (this.isOnHeavenPath) {
      path = Grid.allCordsForHeaven[this.team];
    }

    if (switchToHeaven !== -1 && switchToHeaven !== (cordsAhead.length - 1)) {
      cords = this._switchToHeavenPath((switchToHeaven + 1), cordsAhead.length);
    } else {
      index = utils.findCordsInArray(cordArray, path);
      index += rolled;
      if (index > (path.length - 1)) {
        index -= (path.length);
      }
      cords = path[index];
    }
  } else if (rolled === 6) {
    cords = Grid.startPoint[this.team];
  }

  return cords;
};

Token.prototype._findAllCordsAhead = function _findAllCordsAhead(rolled) {
  var cordArray = [this.cords.x, this.cords.y];
  var initialIndex;
  var endingIndex;
  var cordsList = [];

  if (this.active) {
    initialIndex = utils.findCordsInArray(cordArray, Grid.path);
    endingIndex = initialIndex + rolled;
    initialIndex += 1; //Excludes first element in slice
    endingIndex += 1; //Includes last element in slice

    cordsList = Grid.path.slice(initialIndex, endingIndex);

    if (endingIndex > (Grid.path.length - 1)) {
      endingIndex -= (Grid.path.length);
      cordsList = cordsList.concat(Grid.path.slice(0, endingIndex));
    }
  } else if (rolled === 6) {
    cordsList = [Grid.startPoint[this.team]];
  }

  return cordsList;
};

Token.prototype._blockadeAhead = function _blockadeAhead(rolled) {
  var blockade = this.player.blockadeAhead(this._findAllCordsAhead(rolled));

  if (blockade) {
    a = 10;
    this.game.emit(Events.TOKEN_BLOCKED, {
      player: this.player.attributes(true),
      token: this.attributes(),
      blockade: {
        tokens: blockade.tokens.map(function(token) {
          return token.attributes();
        })
      }
    });
  }

  return blockade;
};

Token.prototype._willAscend = function _willAscend(cords) {
  return cords === Grid.ascendingPoint[this.team];
};

Token.prototype._willOverShootAscendingPoint = function _willOverShootAscendingPoint(rolled) {
  var totalHeavenPath = Grid.allCordsForHeaven[this.team];
  var cordArray = [this.cords.x, this.cords.y];
  var index = utils.findCordsInArray(cordArray, totalHeavenPath);
  index += 1;
  var exactRolled = totalHeavenPath.length - index;
  var diff;

  if (this.isOnHeavenPath && rolled > exactRolled) {
    diff = rolled - exactRolled;
    this.game.emit(Events.OVER_SHOOT, { token: this.attributes(), by: diff });
    return true;
  }

  return false;
};

Token.prototype._createBlockade = function _createBlockade(cords, allyTokens) {
  allyTokens.push(this);
  this.player.registerBlockade(cords, allyTokens);
  this.game.emit(Events.TOKEN_BLOCKADE, { tokens: allyTokens, cords: cords });
};

Token.prototype._switchToHeavenPath = function _switchToHeavenPath(intialIndex, cordArrayLength) {
  var heavenPath = Grid.heaven[this.team];
  var cordsArray;
  var cords;

  cords = heavenPath[(cordArrayLength - 1) - intialIndex];

  return cords;
};

//TODO: Remove this function no longer in use
Token.prototype.moveBy = function moveBy(rolled) {
  var newCord = this._forecastCords(rolled);
  this.moveTo({x: newCord[0], y: newCord[1]});
};

Token.prototype.moveTo = function moveTo(cords) {
  var cordArray = [cords.x, cords.y];
  var enemyToken = this.player.enemyTokenAt(cordArray);
  var allyTokens = this.player.allyTokensAt(cordArray, this);
  var onHeavenPath = this._onHeavenPath(cordArray);
  var ascendCord = Grid.ascendingPoint[this.team];

  if (this.inBlockade) this._leaveBlockade();
  if (enemyToken) this._kill(enemyToken);
  if (allyTokens) this._createBlockade(cordArray, allyTokens);

  if (onHeavenPath) this.isOnHeavenPath = true;
  if (cordArray.toString() === ascendCord.toString()) {
    this._ascend();
  }

  this.cords.x = cords.x;
  this.cords.y = cords.y;
  this.game.pushEvent(Events.TOKEN_MOVE_TO, { token: this.attributes(), cords: this.cords});
};

Token.prototype._leaveBlockade = function _leaveBlockade() {
  var cords = [this.cords.x, this.cords.y];
  var allyTokens;
  this.inBlockade = false;
  allyTokens = this.player.allyTokensAt(cords, this);
  this.player.registerBlockade(cords, allyTokens);
};

Token.prototype._ascend = function _ascend() {
  this.ascended = true;
  this.game.emit(Events.TOKEN_ASCEND, { token: this.attributes() });
};

Token.prototype._onHeavenPath = function _onHeavenPath(cords) {
  var totalHeavenPath = Grid.allCordsForHeaven[this.team];
  var index = utils.findCordsInArray(cords, totalHeavenPath);

  return index !== -1;
};

Token.prototype.killedBy = function killedBy(otherToken) {
  this.active = false;
  this.cords = { x: 0, y: 0 };
};

Token.prototype._kill = function _kill(killedToken) {
  killedToken.killedBy(this);
  this.game.emit(Events.TOKEN_KILLED, { killed: killedToken.attributes(), by: this.attributes() });
};
