describe("Game", function() {
  var game, emitter,
  player = {name: "A Player"};

  beforeEach(function() {
    game = new Ludo.Game();
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
      player.isReady = sinon.stub().returns(true);
      game.addPlayer(player);
      game.start();
      game.started.should.equal(true);
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
      player.isReady = sinon.stub().returns(true);
      game.addPlayer(player);
      game.start();
      spy.should.have.been.called;
    });
  });

  it("calls turn on the player, when its their turn");
  it("runs a loop of checks after each players turn");
  it("can check to see if the game was won");
});
