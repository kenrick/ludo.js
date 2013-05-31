describe("Player", function() {
  var game, player;

  beforeEach(function() {
    player = new Ludo.Player();
  });

  it("can set itself to ready", function() {
    player.ready();
    player.isReady().should.equal(true);
  });
});
