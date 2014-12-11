var constants = require('./constants');
var Grid = constants.Grid;
var Teams = constants.Teams;

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

var findCordsInArray = exports.findCordsInArray = function(needle, haystack) {
  return haystack.findIndex(function(e, index) {
    if(e[0] == needle[0] && e[1] == needle[1] ) return 1;
  });
};

exports.cordBelongsTo = function(cordArray) {
  for (var i = 0; i <= 3; i++) {
    if(findCordsInArray(cordArray, Grid.allCordsForTeam[Teams[i]]) !== -1) {
      return Teams[i];
    }
  }

  return false;
};
