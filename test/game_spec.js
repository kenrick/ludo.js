describe("Game", function() {
  var game, emitter, player, player2, player3;

  beforeEach(function() {
    game = new Ludo.Game();
    player = mockPlayer("Player1");
    player2 = mockPlayer("Player2");
    player3 = mockPlayer("Player3");

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

  it("calls joined game on the player, with its game instance", function() {
    game.addPlayer(player);
    player.joinGame.should.have.been.calledWith(game);
  });

  it("returns the player thats turn is next", function() {
    game.addPlayer(player);
    game.addPlayer(player2);
    game.nextPlayersTurn().should.equal(player);
  });

  describe("initialize", function() {
    it("can accept options for events", function() {
      var options = {
        events: {
          "game:started": sinon.spy()
        }
      };
      var game = new Ludo.Game(options);
      game.addPlayer(player);
      game.start();
      options.events['game:started'].called.should.equal(true);
    });
  });

  describe("start", function() {
    it("returns false if there are no players", function() {
      game.start();
      game.started.should.equal(false);
    });

    it("returns false if all players are not ready", function() {
      player.isReady = sinon.stub().returns(false);
      game.addPlayer(player);
      game.start();
      game.started.should.equal(false);
    });

    it("returns true if all players are ready", function() {
      game.addPlayer(player);
      game.start();
      game.started.should.equal(true);
    });

    it("runs the the loop method", function() {
      game.addPlayer(player);
      game.loop = sinon.spy();
      game.start();
      game.loop.called.should.equal(true);
    });

  });

  describe("events", function() {
    it("can listen for and trigger", function(done) {
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
      spy.called.should.equal(true);
    });
  });

  describe("loop", function() {
    it("invokes turn on the next player in line, when the loop starts", function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      game.start();
      player.beginTurn.called.should.equal(true);
    });
    describe("invokeTurn", function() {
      it("sets the current turn to the first player at the starting of the game", function() {
        game.addPlayer(player);
        game.addPlayer(player2);
        game.invokeTurn(player);
        game.currentPlayersTurn.should.equal(player);
      });

      it("sets the next turn to the second player, after invokeTurn is called", function() {
        game.addPlayer(player);
        game.addPlayer(player2);
        game.invokeTurn(player);
        game.nextPlayersTurn().should.equal(player2);
      });

      it("sets the next turn to the first player, if its the last players turn", function() {
        game.addPlayer(player);
        game.addPlayer(player2);
        game.invokeTurn(player2);
        game.nextPlayersTurn().should.equal(player);
      });
    });

    it("can continue running the loop after a player's turn", function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      game.addPlayer(player3);
      game.start();
      game.continueGame();
      game.nextPlayersTurn().should.equal(player3);
    });

    it("can check to see if the game was won");
  });
});
