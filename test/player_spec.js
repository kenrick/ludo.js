describe("Player", function() {
  var game, player;

  beforeEach(function() {
    game = {
      events: {
        emit: sinon.spy()
      },
      continueGame: sinon.spy()
    };
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
      player.joinGame(game);
      player.game.should.equal(game);
    });

    it("fires player:joined on the game, when it joins", function() {
      player.joinGame(game);
      game.events.emit.should.be.calledWith("player:joined");
    });
  });
  describe("beginTurn", function() {
    it("fires player:turn:begins on the game, turn begins", function() {
      player.game = game;
      player.beginTurn();
      game.events.emit.should.be.calledWith("player:turn:begins", player);
    });
  });

  describe("endTurn", function() {
    it("fires player:turn:ends on the game, turn begins", function() {
      player.game = game;
      player.endTurn();
      game.events.emit.should.be.calledWith("player:turn:end", player);
    });

    it("calls continueGame on the game instance", function() {
      player.game = game;
      player.endTurn();
      game.continueGame.called.should.equal(true);
    });
  });
});
