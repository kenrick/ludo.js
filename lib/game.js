var Ludo = Ludo || {};

(function (exports) {
  // Place the script in strict mode
  'use strict';

  function Game() {
    this.players = [];
    this.started = false;
  }

  Game.prototype.addPlayer = function(player) {
    if(this.players.length <= 3) {
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
    }

  }


  exports.Game = Game;
})(typeof exports === 'undefined'? Ludo : exports);
