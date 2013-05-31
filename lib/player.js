var Ludo = Ludo || {};

(function (exports) {
  // Place the script in strict mode
  'use strict';

  function Player() {
    this.readied = false;
  }

  Player.prototype.ready = function() {
    this.readied = true;
  }

  Player.prototype.isReady = function() {
    return this.readied;
  }


  exports.Player = Player;
})(typeof exports === 'undefined'? Ludo : exports);
