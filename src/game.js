var debug = require('debug')('ludo:game');

var EventEmitter = require('eventemitter2').EventEmitter2;
var Player = require('./player').Player;
var Dice = require('./dice').Dice;
var constants = require('./constants');
var Mode = constants.Mode;
var clientSync = require('./sync/client');
var serverSync = require('./sync/server');
var Events = constants.Events;
var utils = require('./utils');
var inherits = require('util').inherits;

function Game(options) {
  this.options = (options || {});
  this.players = [];
  this.started = false;
  this.currentPlayersTurn = '';
  this.mode = (this.options.mode || Mode.OFFLINE);
  this.won = false;
  this.numberOfDie = (this.options.numberOfDie || 1);
  this.localPlayer = (this.options.localPlayer || false);
  this.sync = null;

  EventEmitter.call(this);
  this._attachEvents(this.options.events);

  if (this.mode === Mode.ONLINE) this.sync = this.options.sync(this, this.options.link);

  if (this.options.state) this.setState(this.options.state);
}

inherits(Game, EventEmitter);

exports.Game = Game;

Game.Client = function Client(options) {
  var opts = (options || {});
  opts.mode = Mode.ONLINE;
  opts.sync = clientSync;
  return new Game(options);
};

Game.Server = function Server(options) {
  var opts = (options || {});
  opts.mode = Mode.ONLINE;
  opts.sync = serverSync;
  return new Game(opts);
};

Game.prototype.state = function state() {
  return utils.clone(this._attributes());
};

Game.prototype.setState = function setState(state) {
  var _this = this;

  this.started = state.started;
  this.won = state.won;
  this.currentPlayersTurn = state.currentPlayersTurn;
  this.players = state.players.map(function(playerJSON) {
    return Player.build(playerJSON, _this);
  });

  if (this.sync) {
    this.sync.setEvents(state.syncEvents);
  }

  if (this.started) this.resumeGame();
};

Game.prototype._attributes = function _attributes() {
  var attributes =  {
    won: this.won,
    started: this.started,
    currentPlayersTurn: this.currentPlayersTurn,
    players: this.players.map(function(player) {
      return player.attributes();
    })
  };

  if (this.sync) {
    attributes.syncEvents = this.sync.getEvents();
  }

  return attributes;
};

Game.prototype._attachEvents = function _attachEvents(events) {
  var event;

  if (typeof events !== undefined) {
    for (event in events) {
      this.on(event, events[event]);
    }
  }
};

Game.prototype.pushEvent = function pushEvent(eventType, payload) {
  var event = JSON.stringify({type: eventType, payload: payload});

  if (this.sync) {
    this.sync.addEvent(event);
  }

  this.emit(eventType, payload);
};

Game.prototype.isOfflineGame = function isOfflineGame() {
  return this.mode === Mode.OFFLINE;
};

Game.prototype.addPlayer = function addPlayer(player) {
  if (this.players.length <= 3) {
    player.joinGame(this);
    player.setTeam(constants.Teams[this.players.length]);

    this.players.push(player);
    this.pushEvent(Events.PLAYER_JOIN, { player: player.attributes(true) });
  }
};

Game.prototype.joinGame = function joinGame(playerData) {
  var player = new Player(playerData);
  player.readyUp();
  this.addPlayer(player);

  debug('player joined');

  return player.attributes(true);
};

Game.prototype.joinGameWithLink = function joinGameWithLink(playerData, link) {
  var player = this.joinGame(playerData);

  if (constants.isServer) {
    this.sync.addClient(link, player);
  }
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
      debug('starting game');

      this.started = true;
      this.pushEvent(Events.GAME_START);
      this._loop();
    }
  }

  return this;
};

Game.prototype._loop = function _loop() {
  var playerWon = this.playerTokensAscended();

  if (playerWon) {
    this.emit(Events.GAME_WON, { player: playerWon.attributes() });
  } else {
    //Calls the next players turn in line.
    var player = this.nextPlayersTurn();
    this.invokeTurn(player);
  }

};

Game.prototype.continueGame = function continueGame() {
  this._loop();
};

Game.prototype.resumeGame = function resumeGame() {
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

Game.prototype.processEvent = function processEvent(event) {
  var payload = event.payload;
  var team;
  var index;
  var player;
  var token;

  switch (event.type) {
    case Events.PLAYER_JOIN:
      this.joinGame(payload.player.metadata);
      break;

    case Events.GAME_START:
      this.start();
      break;

    case Events.TURN_END:
    case Events.REPEAT_TURN:
      team = payload.player.team;
      index = constants.Teams.indexOf(team);
      player = this.players[index];
      player.endTurn();
      break;

    case Events.REG_DICE:
      team = payload.player.team;
      index = constants.Teams.indexOf(team);
      player = this.players[index];
      player.registerDice(new Dice({rolled: payload.dices[0].rolled }));
      // this.pushEvent(Events.REG_DICE, payload);
      break;

    case Events.TOKEN_BORN:
      team = payload.token.team;
      index = constants.Teams.indexOf(team);
      player = this.players[index];
      token = player._tokens[payload.token.id];
      token.born();
      break;

    case Events.TOKEN_MOVE_TO:
      team = payload.token.team;
      index = constants.Teams.indexOf(team);
      player = this.players[index];
      token = player._tokens[payload.token.id];
      token.moveTo(payload.cords);
      break;
  }
};
