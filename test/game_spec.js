describe("Game", function() {
  it("can start a new game", function() {
    var game = new Ludo.Game();
    game.start();
    game.started.should.equal(true);
  });


  it("can add a new player to the game");
  it("can add up to 4 players to the game");
  it("calls turn on the player, when its their turn");
  it("runs a loop of checks after each players turn");
  it("can check to see if the game was won");
});
