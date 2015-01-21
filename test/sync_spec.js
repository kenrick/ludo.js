var helper = require('./spec_helper');
var Ludo = require('../index');
var EventEmitter = require('eventemitter2').EventEmitter2;

describe('Sync', function() {
  var clientGame;
  var client2Game;
  var serverGame;
  var player =  {name: 'P1'};
  var player2 = {name: 'P2'};
  var client;
  var client2;

  beforeEach(function() {
    client  = new EventEmitter();
    client2 = new EventEmitter();

    serverGame = Ludo.Game.Server();
    clientGame = Ludo.Game.Client({link: client});
    client2Game = Ludo.Game.Client({link: client2 });
  });

  describe('Connect', function() {
    beforeEach(function() {
      serverGame.joinGameWithLink(player, client);
    });

    it('connects the client to the server', function() {
      client.emit('client.connect', function(clientData, gameState) {
        expect(clientData.player.metadata).to.eql(player);
        expect(gameState).to.eql(serverGame.state());
      });
    });

    it('sets the localPlayer and gameState', function(done) {
      clientGame.sync.connect(function(connected) {
        expect(clientGame.state()).to.eql(serverGame.state());
        expect(clientGame.localPlayer).not.to.be.false();

        done();
      });
    });
  });

  describe('Player Join', function() {
    beforeEach(function() {
      serverGame.joinGameWithLink(player, client);
    });

    it('tells client 1 that client 2 joined', function(done) {
      var spy = helper.sinon.spy();
      var clientSpy = { emit: spy, on: helper.sinon.stub() };

      client.on('client.join', function(payload) {
        expect(payload.player.metadata).to.eql(player2);
        done();
      });

      serverGame.joinGameWithLink(player2, clientSpy);
      expect(clientSpy.emit.called).to.be.false();
    });

    it('adds the player to client 1\'s game ', function() {
      clientGame.sync.connect();

      serverGame.joinGameWithLink(player2, client2);
      expect(clientGame.players[1].metadata).to.eql(player2);
    });

    it('expects the server, clientGame and client2Game to have the same state', function() {
      clientGame.sync.connect();

      serverGame.joinGameWithLink(player2, client2);

      client2Game.sync.connect();

      expect(serverGame.state()).to.eql(clientGame.state());
      expect(serverGame.state()).to.eql(client2Game.state());
      expect(clientGame.state()).to.eql(client2Game.state());
    });
  });

  describe('Game start', function() {
    it('tells all clients to start their games', function(done) {
      var plan = helper.plan(2, done);
      var client  = new EventEmitter();
      var client2 = new EventEmitter();

      serverGame.joinGameWithLink(player, client);
      serverGame.joinGameWithLink(player2, client2);

      client.on('client.startGame', function(payload) {
        plan.ok();
      });

      client2.on('client.startGame', function(payload) {
        plan.ok();
      });

      serverGame.start();
    });

    it('expects all client games to be started', function() {
      serverGame.joinGameWithLink(player, client);
      serverGame.joinGameWithLink(player2, client2);

      clientGame.sync.connect(function() {
        client2Game.sync.connect(function() {
          serverGame.start();
        });
      });

      expect(clientGame.started).to.be.true();
      expect(client2Game.started).to.be.true();

      expect(serverGame.state()).to.eql(clientGame.state());
      expect(serverGame.state()).to.eql(client2Game.state());
      expect(clientGame.state()).to.eql(client2Game.state());
    });

  });

  describe('Roll Dice', function() {
    beforeEach(function() {
      serverGame.joinGameWithLink(player, client);
      serverGame.joinGameWithLink(player2, client2);
    });

    it('rolls the dice on the server', function(done) {
      var diceNum;
      var plan = helper.plan(3, done);

      clientGame.once('player.turn.begin', function(payload) {
        payload.rollDice();
        plan.ok();
      });

      clientGame.once('player.registerDice', function(payload) {
        diceNum = payload.dices[0];
        plan.ok();
      });

      client2Game.once('player.registerDice', function(payload) {
        expect(payload.dices[0].rolled).to.eql(diceNum.rolled);
        plan.ok();
      });

      clientGame.sync.connect(function() {
        client2Game.sync.connect(function() {
          serverGame.start();
        });
      });

    });

  });

  describe('Take Action', function() {
    beforeEach(function() {
      serverGame.joinGameWithLink(player, client);
      serverGame.joinGameWithLink(player2, client2);

      serverGame.players[0]._tokens[0].born();
    });

    it('take action on client 1 send the action to the server', function(done) {
      var plan = helper.plan(3, done);
      var action;
      var tokenId;

      clientGame.once('player.turn.begin', function(payload) {
        expect(payload.canRollDice()).to.be.true();

        setTimeout(function() {
          payload.rollDice();
        }, 0);

        plan.ok();
      });

      clientGame.once('player.takeAction', function(payload) {
        var actions;

        expect(payload.canTakeAction()).to.be.true();

        actions = payload.getActionsForDice(1);
        action = actions[0];

        tokenId = action.token.id;

        setTimeout(function() {
          action.take();
        }, 0);

        plan.ok();
      });

      serverGame.sync.getClients()[0].link.on('server.takeAction', function(payload) {
        expect(tokenId).to.equal(payload.tokenId);
        plan.ok();
      });

      clientGame.sync.connect(function() {
        client2Game.sync.connect(function() {
          serverGame.start();
        });
      });

    });

    it('take action on client 1 send the action to client2', function(done) {
      var plan = helper.plan(3, done);
      var action;
      var tokenId;

      clientGame.once('player.turn.begin', function(payload) {
        expect(payload.canRollDice()).to.be.true();

        setTimeout(function() {
          payload.rollDice();
        }, 0);

        plan.ok();
      });

      clientGame.once('player.takeAction', function(payload) {
        var actions;

        expect(payload.canTakeAction()).to.be.true();

        actions = payload.getActionsForDice(1);
        action = actions[0];

        tokenId = action.token.id;

        setTimeout(function() {
          action.take();
        }, 0);

        plan.ok();
      });

      client2Game.once('player.takeAction', function(payload) {
        expect(payload.canTakeAction()).to.be.false();

        expect(serverGame.state()).to.eql(clientGame.state());
        expect(serverGame.state()).to.eql(client2Game.state());
        expect(clientGame.state()).to.eql(client2Game.state());

        plan.ok();
      });

      clientGame.sync.connect(function() {
        client2Game.sync.connect(function() {
          serverGame.start();
        });
      });

    });

  });
});
