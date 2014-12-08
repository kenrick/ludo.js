function Player(metadata) {
  this.metadata = metadata;
  this.readied = false;
  this.game = false;
}

Player.prototype.ready = function() {
  this.readied = true;
};

Player.prototype.isReady = function() {
  return this.readied;
};

Player.prototype.rolled = function(dice) {
  var rolled = dice.rolled;
  var possibleMoves = this.generatePossibleMoves(rolled);
};

Player.prototype.beginTurn = function() {
  this.game.events.emit("player:turn:begins", this);
  this.game.actuator.handlePlayerTurn(this, function(dice) {
    this.endTurn();
  });
};

Player.prototype.generatePossibleMoves = function(rolled) {

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
