var Ludo = require('../index');
var helper = require('./spec_helper');
var newGameState = require('./fixtures/new_game_state');
var midGameState = require('./fixtures/mid_game_state');

describe('Integration', function() {
  var game;
  var player;
  var player2;
  var player3;
  var player4;

  beforeEach(function() {
    game = new Ludo.Game();
    player1 = new Ludo.Player({name: 'P1'});
    player2 = new Ludo.Player({name: 'P2'});

    player1.readyUp();
    player2.readyUp();

    game.addPlayer(player1);
    game.addPlayer(player2);

  });

  describe('New Game from existing state', function() {
    it('creates a new game from existing state', function() {
      game = new Ludo.Game({ state: midGameState});

      expect(game.started).to.be.true();
      expect(game.currentPlayersTurn).to.equal('bl');

      expect(game.players.length).to.equal(2);
      expect(game.players[0]._tokens.length).to.equal(4);

      expect(game.state()).eql(midGameState);
    });
  });

  describe('Game State', function() {
    it('returns a blank game state', function() {
      expect(game.state()).to.eql(newGameState);
    });

    it('returns a mid game state', function() {
      game.start();
      player1._tokens[0].born();
      player1._tokens[1].born();
      player1._tokens[1].moveBy(6);
      player1._tokens[0].moveBy(6);

      player2._tokens[0].born();
      player2._tokens[0].moveBy(5);

      expect(game.state()).to.eql(midGameState);
    });
  });

  describe('Player2 kills Player1s token', function() {

    beforeEach(function() {
      player1._tokens[0].born();
      player2._tokens[0].born();
      player2._tokens[0].moveTo({ x: 7, y: 15 });

      game.currentPlayersTurn = 'bl';
    });

    it('kills player1 token 0', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('killMove');
        actions[0].take();
        plan.ok();
      });

      game.once('token.killed', function(data) {
        data.killed.should.eql(player1._tokens[0].attributes());
        data.by.should.eql(player2._tokens[0].attributes());
        plan.ok();
      });

      game.start();
    });

  });

  describe('MoveBy', function() {

    beforeEach(function() {
      player1._tokens[0].born();
      game.currentPlayersTurn = 'br';
    });

    it('moves player1 token:0', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('moveBy');
        actions[0].take();
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 7, y: 13});
        plan.ok();
      });

      game.start();
    });

  });

  describe('Switch to heaven path', function() {

    beforeEach(function() {
      game.currentPlayersTurn = 'br';
    });

    it('moves token unto the heaven path by 2', function(done) {
      var plan = helper.plan(2, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 9, y: 15 });

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 3 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('moveBy');
        actions[0].take();
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 8, y: 13});
        expect(player1._tokens[0].isOnHeavenPath).to.be.true();
        plan.ok();
      });

      game.start();
    });

    it('moves token unto the heaven path by 3', function(done) {
      var plan = helper.plan(2, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 9, y: 15 });

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 4 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('moveBy');
        actions[0].take();
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 8, y: 12});
        expect(player1._tokens[0].isOnHeavenPath).to.be.true();
        plan.ok();
      });

      game.start();
    });

    it('moves token unto the heaven path from startPoint', function(done) {
      var plan = helper.plan(2, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 8, y: 15 });

      expect(player1._tokens[0].isOnHeavenPath).to.be.true();

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 4 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('moveBy');
        actions[0].take();
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 8, y: 11});
        plan.ok();
      });

      game.start();
    });

    it('moves token unto the heaven path from startPoint', function(done) {

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 8, y: 14 });

      expect(player1._tokens[0].isOnHeavenPath).to.be.true();

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 6 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);
      });

      game.once('token.overShotAscension', function(data) {
        expect(data.token).to.eql(player1._tokens[0].attributes());
        expect(data.by).to.equal(1);
        done();
      });

      game.start();
    });

  });

  describe('Ascending', function() {

    beforeEach(function() {
      game.currentPlayersTurn = 'br';
    });

    it('Ascendeds token 0 when it reaches the ascendingPoint', function(done) {
      var plan = helper.plan(3, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 8, y: 10 });

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('ascend');
        actions[0].take();
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 8, y: 9});
        expect(player1._tokens[0].ascended).to.be.true();
        plan.ok();
      });

      game.once('token.ascend', function(data) {
        expect(player1._tokens[0].attributes()).to.eql(data.token);
        plan.ok();
      });

      game.start();
    });
  });

  describe('Win', function() {

    beforeEach(function() {
      game.currentPlayersTurn = 'br';
    });

    it('Ascendeds token 0 when it reaches the ascendingPoint', function(done) {
      var plan = helper.plan(4, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 8, y: 9 });
      player1._tokens[1].born();
      player1._tokens[1].moveTo({ x: 8, y: 9 });
      player1._tokens[2].born();
      player1._tokens[2].moveTo({ x: 8, y: 9 });
      player1._tokens[3].born();
      player1._tokens[3].moveTo({ x: 8, y: 10 });

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('ascend');
        actions[0].take();
        plan.ok();
      });


      game.once('token.moveTo', function(data) {
        expect(player1._tokens[3].cords).to.eql({x: 8, y: 9});
        expect(player1._tokens[3].ascended).to.be.true();
        plan.ok();
      });

      game.once('token.ascend', function(data) {
        expect(player1._tokens[3].attributes()).to.eql(data.token);
        plan.ok();
      });

      game.once('game.won', function(data) {
        expect(player1.attributes()).to.eql(data.player);
        plan.ok();
      });

      game.start();
    });
  });

  describe('Create blockade', function() {

    beforeEach(function() {
      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 7, y: 13 });
      player1._tokens[1].born();

      game.currentPlayersTurn = 'br';
    });

    it('player1 token:0 and token:1 creates a blockade', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[1].type).to.equal('createBlockade');
        actions[1].take();
        plan.ok();
      });

      game.once('token.blockade', function(data) {
        expect(player1.blockades).to.have.property([7, 13]);
        plan.ok();
      });

      game.start();
    });

  });

  describe('Disband blockade', function() {

    beforeEach(function() {
      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 7, y: 13 });
      player1._tokens[1].born();
      player1._tokens[1].moveTo({ x: 7, y: 13 });

      game.currentPlayersTurn = 'br';
    });

    it('player1 token:0 and token:1 disband blockade', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);

        expect(actions[0].type).to.equal('moveBy');
        actions[0].take();
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 7, y: 12});
        expect(player1._tokens[0].inBlockade).to.be.false();
        expect(player1._tokens[1].inBlockade).to.be.false();
        plan.ok();
      });

      game.start();
    });

  });

  describe('Blockade Ahead', function() {

    beforeEach(function() {
      player1._tokens[0].born();
      player1._tokens[1].born();
      player2._tokens[0].born();
      player2._tokens[0].moveTo({x: 7, y: 15});

      game.currentPlayersTurn = 'bl';
    });

    it('player1 token:0 and token:1 blocks player2 token:0', function(done) {

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 1 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);
      });

      game.once('token.blocked', function(data) {
        expect(data.token).to.eql(player2._tokens[0].attributes());
        expect(data.blockade.tokens).to.eql([player1._tokens[0].attributes(), player1._tokens[1].attributes()]);
        done();
      });

      game.start();
    });

  });

  describe('Blockade Ahead on Starting Point', function() {

    beforeEach(function() {
      player2._tokens[0].born();
      player2._tokens[0].moveTo({x: 7, y: 14});
      player2._tokens[1].born();
      player2._tokens[1].moveTo({x: 7, y: 14});

      game.currentPlayersTurn = 'br';
    });

    it('player2 token:0 and token:1 blocks player1 token:0 from borning', function(done) {

      game.once('player.turn.begin', function(payload) {
        var dice = new Ludo.Dice({ rolled: 6 });
        var actions;

        dice.roll();
        payload.registerDice(dice);
        actions = payload.getActionsForDice(1);
      });

      game.once('token.blocked', function(data) {
        // expect(data.token).to.eql(player1._tokens[0].attributes());
        // expect(data.blockade.tokens).to.eql([player2._tokens[0].attributes(), player2._tokens[1].attributes()]);
        done();
      });

      game.start();
    });

  });

});
