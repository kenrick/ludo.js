var Ludo = Ludo || {};

(function (exports) {
  // Place the script in strict mode
  'use strict';

  function Game() {}

  Game.prototype.start = function () {
    this.started = true;
  }


  exports.Game = Game;
})(typeof exports === 'undefined'? Ludo : exports);
