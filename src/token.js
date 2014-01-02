var Ludo = Ludo || {};

(function (exports) {
  'use strict';

  function Token(options) {
    this.player = options.player || false;
    this.position = options.position || false;
  }

  exports.Token = Token;
})(typeof exports === 'undefined'? Ludo : exports);
