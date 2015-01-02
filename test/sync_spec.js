var helper = require('./spec_helper');
var Ludo = require('../index');
var serverSync = require('../src/sync/server');
var clientSync = require('../src/sync/client');
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
    serverGame = new Ludo.Game({mode: 'online'});
    clientGame = new Ludo.Game({mode: 'online'});
    client2Game = new Ludo.Game({mode: 'online'});

    client  = new EventEmitter();
    client2 = new EventEmitter();
  });

  describe('Connect', function() {
    beforeEach(function() {
      serverGame.sync = serverSync(serverGame);
      serverGame.joinGameWithLink(player, client);
    });

    it('connects the client to the server', function() {
      client.emit('client.connect', function(playerData, gameState) {
        expect(playerData.metadata).to.eql(player);
        expect(gameState).to.eql(serverGame.state());
      });
    });

    it('sets the localPlayer and gameState', function(done) {
      clientGame.sync = clientSync(clientGame, client);
      clientGame.sync.connect(function(connected) {
        expect(clientGame.state()).to.eql(serverGame.state());
        expect(clientGame.localPlayer).not.to.be.false();

        done();
      });
    });
  });

  describe('Player Join', function() {
    beforeEach(function() {
      serverGame.sync = serverSync(serverGame);
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
      clientGame.sync = clientSync(clientGame, client);
      clientGame.sync.connect();

      serverGame.joinGameWithLink(player2, client2);
      expect(clientGame.players[1].metadata).to.eql(player2);
    });

    it('expects the server, clientGame and client2Game to have the same state', function() {
      clientGame.sync = clientSync(clientGame, client);
      clientGame.sync.connect();

      serverGame.joinGameWithLink(player2, client2);

      client2Game.sync = clientSync(client2Game, client2);
      client2Game.sync.connect();

      expect(serverGame.state()).to.eql(clientGame.state());
      expect(serverGame.state()).to.eql(client2Game.state());
      expect(clientGame.state()).to.eql(client2Game.state());
    });
  });

  describe('Game start', function() {
    beforeEach(function() {
      serverGame.sync = serverSync(serverGame);
      serverGame.joinGameWithLink(player, client);
      serverGame.joinGameWithLink(player2, client2);
    });

    it('tells all clients to start their games', function(done) {
      var plan = helper.plan(2, done);

      client.on('client.startGame', function(payload) {
        plan.ok();
      });

      client2.on('client.startGame', function(payload) {
        plan.ok();
      });

      serverGame.start();
    });

    it('expects all client games to be started', function() {

      clientGame.sync = clientSync(clientGame, client);
      clientGame.sync.connect();

      client2Game.sync = clientSync(client2Game, client2);
      client2Game.sync.connect();

      serverGame.start();

      expect(clientGame.started).to.be.true();
      expect(client2Game.started).to.be.true();

      expect(serverGame.state()).to.eql(clientGame.state());
      expect(serverGame.state()).to.eql(client2Game.state());
      expect(clientGame.state()).to.eql(client2Game.state());
    });

  });
});
