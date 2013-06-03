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

  Player.prototype.turn = function() {
    this.game.events.emit("player:turn", this);
  };

  Player.prototype.joinGame = function(game) {
    this.game = game;
    this.game.events.emit("player:joined");
    return true;
  };


  exports.Player = Player;
})(typeof exports === 'undefined'? Ludo : exports);
