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
