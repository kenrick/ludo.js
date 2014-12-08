var EventEmitter = require('events').EventEmitter;
var Actuator = require('./actuator');

function Game(options) {

  this.options = (options || {});
  this.actuator = this.options.actuator || (new Actuator());
  this.players = [];
  this.started = false;
  this.events = (new EventEmitter());
  this.attachEvents(this.options.events);
  this.currentPlayersTurn = false;
}

Game.prototype.attachEvents = function (events) {
  if(typeof events !== "undefined") {
    for(var e in events) {
      this.events.on(e, events[e]);
    }
  }
};

Game.prototype.addPlayer = function (player) {
  if(this.players.length <= 3) {
    player.joinGame(this);
    this.players.push(player);
    this.actuator.handlePlayerAdded(player);
  }
};

Game.prototype.start = function() {
  if(!this.started) {
    var readies = 0;

    for (var i = 0; i < this.players.length; i++) {
      if(this.players[i].isReady()) {
        readies++;
      }
    }

    if(this.players.length <= 0 || this.players.length != readies) {
      this.actuator.handleNotEnoughReadyPlayers();
      this.started = false;
    }
    else {
      this.started = true;
      this.events.emit("game:started");
      this.actuator.handleGameStart();
      this.loop();
    }
  }
};

Game.prototype.loop = function() {
  //Calls the next players turn in line.
  var player = this.nextPlayersTurn();
  this.invokeTurn(player);
};

Game.prototype.continueGame = function() {
  this.loop();
};

Game.prototype.invokeTurn = function(player) {
  this.currentPlayersTurn = player;
  return player.beginTurn();
};

Game.prototype.nextPlayersTurn = function() {
  var nextPlayer;
  if(this.currentPlayersTurn) {
    var playerIndex = this.players.indexOf(this.currentPlayersTurn);
    if(playerIndex !== this.players.length - 1) {
      nextPlayer = this.players[playerIndex + 1];
    }
    else {
      nextPlayer = this.players[0];
    }
  }
  else {
    nextPlayer = this.players[0];
  }
  return nextPlayer;
};


module.exports = Game;
