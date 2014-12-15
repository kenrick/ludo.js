var constants = require('./constants');
var Events = constants.Events;
var Token = require('./token');

function Player(metadata) {
  this.metadata = metadata;
  this._ready = false;
  this.game = false;
  this.team = false;
  this._tokens = [];
}

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
  var actions;
  var totalActions = [];
  var i;

  for (i = 0; i <= 3; i++) {
    actions = this._tokens[i].getPossibleActions(rolled);

    totalActions = totalActions.concat(actions);
  }

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

Player.prototype.tokenLocatedAt = function tokenLocatedAt(cords) {
  var token;
  var i;

  for (i = 0; i < this._tokens.length; i++) {
    token = this._tokens[i];
    if (token.cords.x === cords[0] && token.cords.y === cords[1]) {
      return token;
    }
  }

  return false;
};

Player.prototype.enemyTokenAt = function enemyTokenAt(cords) {
  return this.game.findTokenAt(cords, this);
};

module.exports = Player;
