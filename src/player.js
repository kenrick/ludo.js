var constants = require('./constants');
var Token = require('./token').Token;
var Events = constants.Events;

function Player(metadata) {
  this.metadata = metadata;
  this._ready = false;
  this.game = false;
  this.team = false;
  this._tokens = [];
  this.blockades = {};
}

exports.Player = Player;

Player.build = function() {

};

Player.prototype.setTeam = function setTeam(team) {
  this.team = team;
  this.createTokensForTeam();
};

Player.prototype.createTokensForTeam = function createTokensForTeam() {
  var id;

  for (id = 0; id <= 3; id++) {
    this._tokens.push(new Token({player: this, id: id}));
  }
};

Player.prototype.readyUp = function readyUp() {
  this.ready = true;
};

Player.prototype.getReady = function getReady() {
  return this.ready;
};

Player.prototype.getActionsByDice = function getActionsByDice(dice) {
  var _this = this;
  var rolled = dice.rolled;
  var possibleActions = this.generatePossibleActions(rolled);

  if (possibleActions.length) {
    this.game.emit(Events.PLAYER_ACTIONS, {
      player: this,
      actions: possibleActions,
      callback: function(action) {
        _this.executeAction(action);
      }
    });
  }
  else {
    this.endTurn();
  }
};

Player.prototype.beginTurn = function beginTurn() {
  var _this = this;
  this.game.emit(Events.TURN_BEGIN, { player: this });
  this.game.emit(Events.DICE_ROLL, {
    player: this,
    callback: function(dice) {
      _this.getActionsByDice(dice);
    }
  });
};

Player.prototype.generatePossibleActions = function generatePossibleActions(rolled) {
  var totalActions = [];

  this._tokens.forEach(function(token) {
    var action = token.getPossibleAction(rolled);
    if (action) totalActions.push(action);
  });

  return totalActions;
};

Player.prototype.executeAction = function executeAction(action) {
  action.token.executeAction(action);

  if (action.rolled === 6) {
    this.game.emit(Events.REPEAT_TURN, { player: this });

    this.beginTurn();
  } else {
    this.endTurn();
  }

};

Player.prototype.endTurn = function endTurn() {
  this.game.emit(Events.TURN_END, { player: this });
  this.game.continueGame();
};

Player.prototype.joinGame = function joinGame(game) {
  this.game = game;
  return true;
};

Player.prototype.registerBlockade = function registerBlockade(cords, tokens) {
  if (tokens.length >= 2) {
    this.blockades[cords] = {tokens: tokens};

    for (i = 0; i < tokens.length; i++) {
      tokens[i].inBlockade = true;
    }
  } else {
    if (tokens[0]) tokens[0].inBlockade = false;
    delete this.blockades[cords];
  }
};

Player.prototype.allTokensAscended = function allTokensAscended() {
  var tokens = [];
  var token;
  var count = 0;

  for (i = 0; i < this._tokens.length; i++) {
    token = this._tokens[i];
    if (token.ascended) count++;
  }

  return count === this._tokens.length;
};

Player.prototype.allyTokensAt = function allyTokensAt(cords, excludedToken) {
  var tokens = this._tokens.filter(function(token) {
    if (excludedToken && token.id === excludedToken.id) return;
    return token.atCords(cords);
  });

  if (!tokens.length) return false;

  return tokens;
};

Player.prototype.hasBlockadeAt = function hasBlockadeAt(cordsArray) {
  var i;
  var cords;

  for (i = 0; i < cordsArray.length; i++) {
    cords = cordsArray[i];
    if (this.blockades[cords]) return this.blockades[cords];
  }

  return false;
};

Player.prototype.tokenLocatedAt = function tokenLocatedAt(cords, excludedToken) {
  var foundToken = false;
  var i;

  this._tokens.some(function(token) {
    if (excludedToken && token.id === excludedToken.id) return;

    if (token.atCords(cords)) foundToken = token;

    return foundToken;
  });

  return foundToken;
};

Player.prototype.blockadeAhead = function blockadeAhead(cordsArray) {
  return this.game.anyBlockadeIn(cordsArray, this);
};

Player.prototype.enemyTokenAt = function enemyTokenAt(cords) {
  return this.game.findTokenAt(cords, this);
};
