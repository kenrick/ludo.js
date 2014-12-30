var constants = require('./constants');
var Token = require('./token').Token;
var Events = constants.Events;

function Player(metadata) {
  this.metadata = metadata;
  this._ready = false;
  this.game = false;
  this.team = '';
  this.dices = [];
  this._tokens = [];
  this.blockades = {};
  this.sync = false;
}

exports.Player = Player;

Player.build = function build(playerState, game) {
  var player = new Player();

  player.metadata = playerState.metadata;
  player._ready = playerState.ready;
  player.team = playerState.team;
  player.game = game;

  playerState.tokens.forEach(function(tokenState) {
    player._tokens.push(Token.build(tokenState, player));
  });

  return player;
};

Player.prototype.attributes = function attributes(only) {
  var attr = {
    metadata: this.metadata,
    ready: this._ready,
    team: this.team
  };

  if (!only) {
    attr.tokens = this._tokens.map(function(token) {
      return token.attributes();
    });
  }

  return attr;
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
  this._ready = true;
};

Player.prototype.getReady = function getReady() {
  return this._ready;
};

Player.prototype.useDice = function useDice(dice) {
  dice.used = true;
  var allUsed = this.dices.every(function(d) {
    return d.used;
  });

  if (allUsed) this.endTurn();
};

Player.prototype.registerDice = function registerDice(firstDice, secondDice) {
  this.dices = [];
  this.dices.push(firstDice);
  if (this.game.numberOfDie === 2) this.dices.push(secondDice);
  this.game.pushEvent(Events.REG_DICE, { player: this.attributes(true), dices: this.dices });
};

Player.prototype.getActionsForDice = function getActionsForDice(position) {
  var _this = this;
  var dice = this.dices[(position - 1)];
  var totalActions = [];

  this._tokens.forEach(function(token) {
    var action = token.getPossibleAction(dice.rolled);
    if (action) {
      action.dice = dice;
      totalActions.push(action);
    }
  });

  return totalActions;
};

//TODO: finish this function
Player.prototype.isLocalPlayer = function isLocalPlayer() {
  return (!this.game.isOfflineGame() && this.game.localPlayer.team === this.team);
};

Player.prototype.beginTurn = function beginTurn() {
  var _this = this;
  if (this.game.isOfflineGame() || this.isLocalPlayer()) {
    this.game.pushEvent(Events.TURN_BEGIN, {
      player: this.attributes(true),
      registerDice: this.registerDice.bind(this),
      getActionsForDice: this.getActionsForDice.bind(this),
      release: function() {
        _this.endTurn();
      },
      canTakeAction: function() {
        return true;
      }
    });
  } else {
    this.game.pushEvent(Events.TURN_BEGIN, {
      player: this.attributes(true),
      canTakeAction: function() {
        return false;
      }
    });
  }
};

Player.prototype.endTurn = function endTurn() {
  var rolledSix = this.dices.some(function(dice) {
    return dice.rolled === 6;
  });

  if (rolledSix) {
    this.game.pushEvent(Events.REPEAT_TURN, { player: this.attributes(true) });
    this.beginTurn();
  } else {
    this.game.pushEvent(Events.TURN_END, { player: this.attributes(true) });
    this.game.continueGame();
  }
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
