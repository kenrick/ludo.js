var Ludo = Ludo || {};

(function (exports) {
  // Place the script in strict mode
  'use strict';

  function Dice() {
    this.rolled = false;
  }

  Dice.prototype.roll = function() {
    if(this.rolled === false) {
      this.rolled = Math.floor( 6 * Math.random() ) + 1;
    }

    return this.rolled;
  };

  exports.Dice = Dice;
})(typeof exports === 'undefined'? Ludo : exports);
