describe("Game", function() {
  var game, emitter, player;

  beforeEach(function() {
    game = new Ludo.Game();
    player = {
      name: "Player1",
      isReady: sinon.stub().returns(true),
      turn: sinon.spy()
    };

    player2 = {
      name: "Player2",
      isReady: sinon.stub().returns(true),
      turn: sinon.spy()
    };

  });

  it("can add a new player to the game", function() {
    game.addPlayer(player);
    game.players.should.include(player);
  });
  it("can add up to 4 players to the game", function() {
    for (var i = 0; i <= 4; i++) {
      game.addPlayer(player);
    }
    game.players.length.should.equal(4);
  });

  it.skip("returns the player thats turn is next", function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      game.start();
      game.nextPlayersTurn().should.equal(player);
  });

  describe("starting", function() {
    it("cant start a new game, if there are no players", function() {
      game.start();
      game.started.should.equal(false);
    });

    it("cant start a new game, when all players are not ready", function() {
      player.isReady = sinon.stub().returns(false);
      game.addPlayer(player);
      game.start();
      game.started.should.equal(false);
    });

    it("can start a new game, when all players are ready", function() {
      game.addPlayer(player);
      game.start();
      game.started.should.equal(true);
    });

    it("runs the loop when game has been started", function() {
      game.addPlayer(player);
      game.loop = sinon.spy();
      game.start();
      game.loop.should.have.been.called;
    });

  });

  describe("events", function() {
    it("can listen for and trigger events", function(done) {
      game.events.on("test", function(data) {
        data.name.should.equal("ye");
        done();
      });
      game.events.emit('test', {name: "ye"});
    });

    it("fires the game:started event when the game starts", function() {
      var spy = sinon.spy();
      game.events.on("game:started", spy);
      game.addPlayer(player);
      game.start();
      spy.should.have.been.called;
    });
  });

  describe("loop", function() {
    it.skip("calls turn on the next player in line", function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      game.start();
      player.turn.should.have.been.called;
    });
    it("can continue running the loop after it was paused");
    it("can check to see if the game was won");
  });
});
