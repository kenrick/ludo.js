var Token = require('./token');

function Player(metadata) {
  this.metadata = metadata;
  this.readied = false;
  this.game = false;
  this.team = false;
  this.tokens = [];
}

Player.prototype.setTeam = function(team) {
  this.team = team;
  this.createTokensForTeam();
};

Player.prototype.createTokensForTeam = function() {
  for (var i = 0; i <= 3; i++) {
    this.tokens.push(new Token({player: this, team: this.team, id: i}));
  }
};

Player.prototype.ready = function() {
  this.readied = true;
};

Player.prototype.isReady = function() {
  return this.readied;
};

Player.prototype.getActionsByDice = function(dice) {
  var rolled = dice.rolled;
  var possibleActions = this.generatePossibleActions(rolled);

  if(possibleActions.length !== 0) {
    this.game.actuator.handlePlayerActionDecision(this, possibleActions, function(action) {
      this.executeAction(action);
      this.endTurn();
    });
  }
  else {
    this.endTurn();
  }
};

Player.prototype.beginTurn = function() {
  this.game.events.emit("player:turn:begins", this);
  this.game.actuator.handlePlayerDiceRoll(this, this.getActionsByDice.bind(this));
};

Player.prototype.generatePossibleActions = function(rolled) {
  var actions, totalActions = [];
  for (var i = 0; i <= 3; i++) {
    actions = this.tokens[i].getPossibleActions(rolled);

    totalActions = totalActions.concat(actions);
  }
  return totalActions;
};

Player.prototype.endTurn = function() {
  this.game.events.emit("player:turn:end", this);
  this.game.continueGame();
};

Player.prototype.joinGame = function(game) {
  this.game = game;
  this.game.events.emit("player:joined");
  return true;
};

module.exports = Player;
