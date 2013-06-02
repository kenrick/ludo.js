var Ludo = Ludo || {};

(function (exports) {
  // Place the script in strict mode
  'use strict';

  function Game(options) {
    var options = options || {};

    this.players = [];
    this.started = false;
    this.events = new exports.Emitter();
    this.attachEvents(options.events);
    this.currentPlayersTurn = false;
  }

  Game.prototype.attachEvents = function (events) {
    if(typeof events !== "undefined") {
      for(var e in events) {
        this.events.on(e, events[e]);
      }
    }
  }

  Game.prototype.addPlayer = function (player) {
    if(this.players.length <= 3) {
      player.joinGame(this);
      this.players.push(player);
    }
  }

  Game.prototype.start = function() {
    var readies = 0;

    for (var i = 0; i < this.players.length; i++) {
      if(this.players[i].isReady()) {
        readies++;
      }
    }

    if(this.players.length <= 0 || this.players.length != readies) {
      this.started = false;
    }
    else {
      this.started = true;
      this.events.emit("game:started");
      this.loop();
    }

  }

  Game.prototype.loop = function() {

    //Calls the next players turn in line.
    var player = this.nextPlayersTurn();
    this.invokeTurn(player);
  }

  Game.prototype.continue = function() {
    this.loop();
  }

  Game.prototype.invokeTurn = function(player) {
    this.currentPlayersTurn = player;
    return player.turn();
  }

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
  }


  exports.Game = Game;

  if(typeof require === "function") {
    exports.Emitter = require('./emitter.js').Emitter;
  }

})(typeof exports === 'undefined'? Ludo : exports);
