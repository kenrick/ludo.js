var constants = require('./constants');
var ActionTypes = constants.ActionTypes;

function Token(options) {
  this.player = options.player;
  this.team = options.team;
  this.id   = options.id;
  this.active = false;
}

Token.prototype.getPossibleActions = function(rolled) {
  var actions = [];

  if(this.active) {

  }
  else {
    if(rolled === 6) {
      actions.push({type: ActionTypes.BORN, token: this});
    }
  }

  return actions;
};

module.exports = Token;
