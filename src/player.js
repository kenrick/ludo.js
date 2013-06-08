var Ludo = Ludo || {};

(function (exports) {
  // Place the script in strict mode
  'use strict';

  function Player() {
    this.readied = false;
    this.game = false;
  }

  Player.prototype.ready = function() {
    this.readied = true;
  };

  Player.prototype.isReady = function() {
    return this.readied;
  };

  Player.prototype.beginTurn = function() {
    this.game.events.emit("player:turn:begins", this);
  };

  Player.prototype.endTurn = function() {
    this.game.events.emit("player:turn:end", this);
    this.game.continueGame();
  };

  Player.prototype.joinGame = function(game) {
    this.game = game;
    this.game.events.emit("player:joined");
    return true;
  };



  exports.Player = Player;
})(typeof exports === 'undefined'? Ludo : exports);
