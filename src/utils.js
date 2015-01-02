var constants = require('./constants');
var Grid = constants.Grid;
var Teams = constants.Teams;

var findCordsInArray = exports.findCordsInArray = function(needle, haystack) {
  return haystack.map(function(cords) {
    return cords.toString();
  }).indexOf(needle.toString());
};

exports.cordBelongsTo = function(cordArray) {
  for (var i = 0; i <= 3; i++) {
    if (findCordsInArray(cordArray, Grid.allCordsForTeam[Teams[i]]) !== -1) {
      return Teams[i];
    }
  }

  return false;
};

exports.clone = function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (obj === null || typeof obj != 'object') return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    return obj.slice(0);
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error('Unable to copy obj! Its type isn\'t supported.');
};
