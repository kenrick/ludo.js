describe("Player", function() {
  var game, player;

  beforeEach(function() {
    game = {
      events: {
        emit: sinon.spy()
      },
      continue: sinon.spy()
    }
    player = new Ludo.Player();
  });

  it("can set itself to ready", function() {
    player.ready();
    player.isReady().should.equal(true);
  });

  describe("joinGame", function() {
    it("can join a game", function() {
      player.joinGame(game).should.equal(true);
    });

    it("sets the game that it was joined to", function() {
      player.joinGame(game)
      player.game.should.equal(game);
    });

    it("fires player:joined on the game, when it joins", function() {
      player.joinGame(game)
      game.events.emit.should.be.calledWith("player:joined");
    });
  });
  describe("turn", function() {
    it("fires player:turn on the game, turn is called", function() {
      player.game = game;
      player.turn();
      game.events.emit.should.be.calledWith("player:turn", player);
    });
  });
});
