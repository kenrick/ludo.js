var helper = require('./spec_helper');
var Player = require('../src/player').Player;
var Dice = require('../src/dice').Dice;

describe('Player', function() {
  var game;
  var player;

  beforeEach(function() {
    game = helper.mockGame();
    player = new Player();
    player.game = game;
    player.setTeam('bl');
  });

  it('can set itself to ready', function() {
    player.readyUp();
    player.getReady().should.equal(true);
  });

  describe('joinGame', function() {
    it('can join a game', function() {
      var game2 = helper.mockGame();
      player.joinGame(game2).should.equal(true);
    });

    it('sets the game that it was joined to', function() {
      var game2 = helper.mockGame();
      player.joinGame(game2);
      player.game.should.equal(game2);
    });
  });

  describe('beginTurn', function() {
    it('fires player:turn:begins on the game', function() {
      player.game = game;
      player.beginTurn();
      var args = game.emit.getCall(0).args[1];
      expect(game.emit.calledWith('player.turn.begin', args)).to.be.true();
      expect(args.player).to.eql(player.attributes(true));
    });
  });

  describe('endTurn', function() {
    it('fires player:turn:ends on the game', function() {
      player.game = game;
      player.endTurn();
      var args = game.emit.getCall(0).args[1];
      expect(game.emit.calledWith('player.turn.end', args)).to.be.true();
      expect(args.player).to.eql(player.attributes(true));
    });

    it('calls continueGame on the game instance', function() {
      player.game = game;
      player.endTurn();
      game.continueGame.called.should.equal(true);
    });
  });

  describe('createTokensForTeam', function() {
    it('creates 4 tokens for that team', function() {
      player._tokens.length.should.equal(4);
    });
  });

  describe('registerBlockade', function() {
    it('registers a blockade', function() {
      player.registerBlockade([5, 9], [player._tokens[0], player._tokens[1]]);
      player.blockades[[5, 9]].tokens.should.eql([player._tokens[0], player._tokens[1]]);
    });

    it('sets in the inBlockade property on token to true', function() {
      player.registerBlockade([5, 9], [player._tokens[0], player._tokens[1]]);
      expect(player._tokens[1].inBlockade).to.be.true();
      expect(player._tokens[0].inBlockade).to.be.true();
    });

    it('disbands blockade if there is only one token', function() {
      player.registerBlockade([5, 9], [player._tokens[0], player._tokens[1]]);
      player.registerBlockade([5, 9], [player._tokens[1]]);
      expect(player._tokens[1].inBlockade).to.be.false();
      expect(player.blockades).not.to.have.property([5, 9]);
    });
  });

  describe('getActionsForDice', function() {
    it('returns born actions for inactive tokens when 6 is rolled', function() {
      player.registerDice((new Dice({rolled: 6})));
      actions = player.getActionsForDice(1);
      actions.length.should.equal(4);

      for (var i = 0; i <= 3; i++) {
        actions[0].type.should.eql('born');
      }
    });
  });

  describe('tokenLocatedAt', function() {
    it('returns a token if at a cord', function() {
      player.game = game;
      player._tokens[0].born();
      player._tokens[0].moveBy(6);
      var token = player.tokenLocatedAt([5, 9]);
      token.should.equal(player._tokens[0]);
    });

    it('returns does not return the token if it excluded', function() {
      player.game = game;
      player._tokens[0].born();
      player._tokens[0].moveBy(6);
      var token = player.tokenLocatedAt([5, 9], player._tokens[0]);
      token.should.equal(false);
    });
  });

  describe('allyTokensAt', function() {
    it('returns a tokens if at a cord', function() {
      player.game = game;
      player._tokens[0].born();
      player._tokens[0].moveBy(6);

      player._tokens[1].born();
      player._tokens[1].moveBy(6);

      var tokens = player.allyTokensAt([5, 9]);
      expect(tokens).to.include(player._tokens[0]);
      expect(tokens).to.include(player._tokens[1]);
      expect(tokens).not.to.include(player._tokens[2]);
    });
  });

  describe('enemyTokenAt', function() {
    it('calls game.findTokenAt ', function() {
      player.enemyTokenAt([5, 9]);
      game.findTokenAt.should.be.calledWith([5, 9], player);
    });
  });
});
