var assign = require('object-assign');

function Actuator() {
  this.debug = false;
}

Actuator.build = function(actuator) {
  return assign(new Actuator(), actuator);
};

Actuator.prototype.log = function() {
  if(this.debug) console.log.apply(console, arguments);
};

Actuator.prototype.handlePlayerAdded = function(player) {
  this.log("Player Joined", player);
};

Actuator.prototype.handleNotEnoughReadyPlayers = function() {
  this.log("Not all players are ready to start the game");
};

Actuator.prototype.handleGameStart = function() {
  this.log("Game Started");
};

Actuator.prototype.handlePlayerDiceRoll = function(player, callback) {
  this.log("handlePlayerDiceRoll requires implementation");
};

Actuator.prototype.handlePlayerActionDecision = function(player, actions, callback) {
  this.log("handlePlayerActionDecision requires implementation");
};

Actuator.prototype.handleTokenBorn = function(token) {
  this.log(token, "is now active");
};

Actuator.prototype.handleTokenMoveTo = function(token, cords) {
  this.log(token, "moved To", cords);
};

Actuator.prototype.handlePlayerAnotherTurn = function(player) {
  this.log(player, "rolled a 6 do they go again");
};


module.exports = Actuator;
