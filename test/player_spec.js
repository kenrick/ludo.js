var helper = require('./spec_helper');
var Player = require('../src/player');

describe("Player", function() {
  var game, player;

  beforeEach(function() {
    game = helper.mockGame();
    player = new Player();
    player.setTeam("bl");
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
    it("fires player:turn:begins on the game", function() {
      player.game = game;
      player.beginTurn();
      game.events.emit.should.be.calledWith("player:turn:begins", player);
    });
  });

  describe("createTokensForTeam", function() {
    it("creates 4 tokens for that team", function() {
      player.tokens.length.should.equal(4);
    });
  });

  describe("generatePossibleActions", function() {
    it("returns born actions for inactive tokens when 6 is rolled", function() {
      actions = player.generatePossibleActions(6);
      actions.length.should.equal(4);

      for (var i = 0; i <= 3; i++) {
        actions[0].type.should.eql("born");
      }
    });
  });

  describe("endTurn", function() {
    it("fires player:turn:ends on the game", function() {
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
