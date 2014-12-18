var helper = require('./spec_helper');
var Game = require('../src/game');

describe('Game', function() {
  var game;
  var player;
  var player2;
  var player3;
  var player4;

  beforeEach(function() {
    game = new Game();
    player = helper.mockPlayer('Player1');
    player2 = helper.mockPlayer('Player2');
    player3 = helper.mockPlayer('Player3');
    player4 = helper.mockPlayer('Player4');
  });

  describe('addPlayer', function() {
    it('fires player.join on the game', function(done) {
      game.on('player.join', function(data) {
        data.player.should.eq(player);
        done();
      });

      game.addPlayer(player);
    });
  });

  it('can add a new player to the game', function() {
    game.addPlayer(player);
    game.players.should.include(player);
  });

  it('can add up to 4 players to the game only', function() {
    for (var i = 0; i <= 8; i++) {
      game.addPlayer(player);
    }
    game.players.length.should.equal(4);
  });

  it('sets the team for each player added', function() {
    game.addPlayer(player);
    game.addPlayer(player2);
    game.addPlayer(player3);
    game.addPlayer(player4);

    game.players[0].setTeam.should.have.been.calledWith('bl');
    game.players[1].setTeam.should.have.been.calledWith('br');
    game.players[2].setTeam.should.have.been.calledWith('tr');
    game.players[3].setTeam.should.have.been.calledWith('tl');
  });

  it('calls joined game on the player, with its game instance', function() {
    game.addPlayer(player);
    player.joinGame.should.have.been.calledWith(game);
  });

  it('returns the player thats turn is next', function() {
    game.addPlayer(player);
    game.addPlayer(player2);
    game.nextPlayersTurn().should.equal(player);
  });

  describe('initialize', function() {
    it('can accept options for events', function() {
      var options = {
        events: {
          'game.start': helper.sinon.spy()
        }
      };
      var game = new Game(options);
      game.addPlayer(player);
      game.start();
      options.events['game.start'].called.should.equal(true);
    });
  });

  describe('start', function() {
    it('fires error if there are no players', function(done) {
      game.on('error', function(data) {
        done();
        data.message.should.equal('Not enough players to start game');
      });

      game.start();
    });

    it('returns false if all players are not ready', function() {
      game.on('error', function(data) {
        done();
        data.message.should.equal('Not all players are ready');
      });

      game.addPlayer(player);
      game.start();
    });

    it('returns true if all players are ready', function() {
      game.addPlayer(player);
      game.start();
      game.started.should.equal(true);
    });

    it('runs the the loop method', function() {
      game.addPlayer(player);
      game._loop = helper.sinon.spy();
      game.start();
      game._loop.called.should.equal(true);
    });

  });

  describe('findTokenAt', function() {
    it('calls tokenLocatedAt on all players', function() {
      game.addPlayer(player);
      game.addPlayer(player2);

      game.findTokenAt([5, 9]).should.equal(false);

      player.tokenLocatedAt.calledOnce.should.equal(true);
      player2.tokenLocatedAt.calledOnce.should.equal(true);
    });

    it('calls tokenLocatedAt on all players except one specified', function() {
      player.team = 'bl';
      player2.team = 'br';
      game.addPlayer(player);
      game.addPlayer(player2);

      game.findTokenAt([5, 9], player).should.equal(false);

      player.tokenLocatedAt.calledOnce.should.equal(false);
      player2.tokenLocatedAt.calledOnce.should.equal(true);
    });

    it('returns a token any player has that token at the cords', function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      player.tokenLocatedAt.returns(true);

      game.findTokenAt([5, 9]).should.equal(true);
    });
  });

  describe('events', function() {
    it('can listen for and trigger', function(done) {
      game.on('test', function(data) {
        data.name.should.equal('ye');
        done();
      });
      game.emit('test', {name: 'ye'});
    });

    it('fires the game.started event when the game starts', function() {
      var spy = helper.sinon.spy();
      game.on('game.start', spy);
      game.addPlayer(player);
      game.start();
      spy.called.should.equal(true);
    });
  });

  describe('loop', function() {
    it('invokes turn on the next player in line, when the loop starts', function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      game.start();
      player.beginTurn.called.should.equal(true);
    });
    describe('invokeTurn', function() {
      it('sets the current turn to the first player at the starting of the game', function() {
        game.addPlayer(player);
        game.addPlayer(player2);
        game.invokeTurn(player);
        game.currentPlayersTurn.should.equal(player);
      });

      it('sets the next turn to the second player, after invokeTurn is called', function() {
        game.addPlayer(player);
        game.addPlayer(player2);
        game.invokeTurn(player);
        game.nextPlayersTurn().should.equal(player2);
      });

      it('sets the next turn to the first player, if its the last players turn', function() {
        game.addPlayer(player);
        game.addPlayer(player2);
        game.invokeTurn(player2);
        game.nextPlayersTurn().should.equal(player);
      });
    });

    it('can continue running the loop after a player\'s turn', function() {
      game.addPlayer(player);
      game.addPlayer(player2);
      game.addPlayer(player3);
      game.start();
      game.continueGame();
      game.nextPlayersTurn().should.equal(player3);
    });

    it('can check to see if the game was won');
  });
});
