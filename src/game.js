var EventEmitter = require('events').EventEmitter;
var Player = require('./player').Player;
var constants = require('./constants');
var Events = constants.Events;
var inherits = require('util').inherits;

function Game(options) {
  this.options = (options || {});
  this.players = [];
  this.started = false;
  this.currentPlayersTurn = '';
  this.won = false;

  EventEmitter.call(this);
  this._attachEvents(this.options.events);

  if (this.options.state) {
    this._setState(this.options.state);
  }
}

inherits(Game, EventEmitter);

exports.Game = Game;

Game.prototype.state = function state() {
  return this._attributes();
};

Game.prototype._setState = function setState(state) {
  var _this = this;

  this.started = state.started;
  this.won = state.won;
  this.currentPlayersTurn = state.currentPlayersTurn;
  this.players = state.players.map(function(playerJSON) {
    return Player.build(playerJSON, _this);
  });

  this.resumeGame();
};

Game.prototype._attributes = function _attributes() {
  return {
    won: this.won,
    started: this.started,
    currentPlayersTurn: this.currentPlayersTurn,
    players: this.players.map(function(player) {
      return player.attributes();
    })
  };
};

Game.prototype._attachEvents = function _attachEvents(events) {
  var event;

  if (typeof events !== undefined) {
    for (event in events) {
      this.on(event, events[event]);
    }
  }
};

Game.prototype.addPlayer = function addPlayer(player) {
  if (this.players.length <= 3) {
    player.joinGame(this);
    player.setTeam(constants.Teams[this.players.length]);

    this.players.push(player);
    this.emit(Events.PLAYER_JOIN, { player: player });
  }
};

//TODO: Implement a joinGame function to add a player to the game
Game.prototype.joinGame = function joinGame(player) {
};

Game.prototype.start = function start() {
  var readies = 0;

  if (!this.started) {
    this.players.forEach(function(player) {
      if (player.getReady()) readies++;
    });

    if (!this.players.length) {
      this.emit(Events.ERROR, { message: 'Not enough players to start game' });
    } else if (this.players.length != readies) {
      this.emit(Events.ERROR, { message: 'Not all players are ready' });
    } else {
      this.started = true;
      this.emit(Events.GAME_START);
      this._loop();
    }
  }

  return this;
};

Game.prototype._loop = function _loop() {
  var playerWon = this.playerTokensAscended();

  if (playerWon) {
    this.emit(Events.GAME_WON, { player: playerWon });
  } else {
    //Calls the next players turn in line.
    var player = this.nextPlayersTurn();
    this.invokeTurn(player);
  }

};

Game.prototype.continueGame = function continueGame() {
  this._loop();
};

Game.prototype.resumeGame = function continueGame() {
  var _this = this;

  this.players.some(function(player) {
    if (player.team === _this.currentPlayersTurn) {
      player.beginTurn();
      return player;
    }
  });
};

Game.prototype.invokeTurn = function invokeTurn(player) {
  this.currentPlayersTurn = player.team;
  return player.beginTurn();
};

Game.prototype.nextPlayersTurn = function nextPlayersTurn() {
  var nextPlayer;

  if (this.currentPlayersTurn) {
    var playerIndex = this.players.map(function(player) {
      return player.team;
    }).indexOf(this.currentPlayersTurn);

    if (playerIndex !== this.players.length - 1) {
      nextPlayer = this.players[playerIndex + 1];
    } else {
      nextPlayer = this.players[0];
    }
  }
  else {
    nextPlayer = this.players[0];
  }
  return nextPlayer;
};

Game.prototype.findTokenAt = function findTokenAt(cords, excludedPlayer) {
  var players = this.players;
  var token = false;

  this.players.some(function(player) {
    if (excludedPlayer && player.team === excludedPlayer.team) return false;
    token = player.tokenLocatedAt(cords);

    return token;
  });

  return token;
};

Game.prototype.playerTokensAscended = function playerTokensAscended() {
  var players = this.players;
  var token;
  var i;

  for (i = 0; i < players.length; i++) {
    player = players[i];

    if (player.allTokensAscended()) return player;
  }

  return false;
};

Game.prototype.anyBlockadeIn = function anyBlockadeIn(cords, excludedPlayer) {
  var players = this.players;
  var blockade;
  var i;

  for (i = 0; i < players.length; i++) {
    player = players[i];

    if (excludedPlayer && player.team === excludedPlayer.team) {
      continue;
    }

    blockade = player.hasBlockadeAt(cords);

    if (blockade) return blockade;
  }

  return false;
};
