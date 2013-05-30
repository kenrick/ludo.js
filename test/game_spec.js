describe("Game", function() {
  it("can start a new game", function() {
    var game = new Ludo.Game();
    game.start();
    game.started.should.equal(true);
  });

  it("can add a new player to the game");
});
