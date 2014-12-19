var Ludo = require('../index');
var helper = require('./spec_helper');

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

  describe('Player2 kills Player1\'s token', function() {

    beforeEach(function() {
      player1._tokens[0].born();
      player2._tokens[0].born();
      player2._tokens[0].moveTo({ x: 7, y: 15 });

      game.currentPlayersTurn = player1;

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 1 });
        dice.roll();
        data.callback(dice);
      });
    });

    it('kills player1 token 0', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('killMove');
        data.callback(data.actions[0]);
        plan.ok();
      });

      game.once('token.killed', function(data) {
        data.killed.should.eql(player1._tokens[0]);
        data.by.should.eql(player2._tokens[0]);
        plan.ok();
      });

      game.start();
    });

  });

  describe('MoveBy', function() {

    beforeEach(function() {
      player1._tokens[0].born();

      game.currentPlayersTurn = player2;

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 1 });
        dice.roll();
        data.callback(dice);
      });
    });

    it('moves player1 token:0', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('moveBy');
        data.callback(data.actions[0]);
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
      game.currentPlayersTurn = player2;
    });

    it('moves token unto the heaven path by 2', function(done) {
      var plan = helper.plan(2, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 9, y: 15 });

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 3 });
        dice.roll();
        data.callback(dice);
      });

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('moveBy');
        data.callback(data.actions[0]);
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

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 4 });
        dice.roll();
        data.callback(dice);
      });

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('moveBy');
        data.callback(data.actions[0]);
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

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 4 });
        dice.roll();
        data.callback(dice);
      });

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('moveBy');
        data.callback(data.actions[0]);
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

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 6 });
        dice.roll();
        data.callback(dice);
      });

      game.once('token.overShotAscension', function(data) {
        expect(data.token).to.eql(player1._tokens[0]);
        expect(data.by).to.equal(1);
        done();
      });

      game.start();
    });

  });


  describe('Ascending', function() {

    beforeEach(function() {
      game.currentPlayersTurn = player2;
    });

    it('Ascendeds token 0 when it reaches thhe ascendingPoint', function(done) {
      var plan = helper.plan(2, done);

      player1._tokens[0].born();
      player1._tokens[0].moveTo({ x: 8, y: 10 });

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 1 });
        dice.roll();
        data.callback(dice);
      });

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('ascend');
        data.callback(data.actions[0]);
        plan.ok();
      });

      game.once('token.moveTo', function(data) {
        expect(player1._tokens[0].cords).to.eql({x: 8, y: 9});
        expect(player1._tokens[0].ascended).to.be.true();
        plan.ok();
      });

      game.once('token.ascend', function(data) {
        expect(player1._tokens[0]).to.eql(data.token);
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

      game.currentPlayersTurn = player2;

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 1 });
        dice.roll();
        data.callback(dice);
      });
    });

    it('player1 token:0 and token:1 creates a blockade', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.actions', function(data) {
        expect(data.actions[1].type).to.equal('createBlockade');
        data.callback(data.actions[1]);
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

      game.currentPlayersTurn = player2;

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 1 });
        dice.roll();
        data.callback(dice);
      });
    });

    it('player1 token:0 and token:1 disband blockade', function(done) {
      var plan = helper.plan(2, done);

      game.once('player.actions', function(data) {
        expect(data.actions[0].type).to.equal('moveBy');
        data.callback(data.actions[0]);
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

      game.currentPlayersTurn = player1;

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 1 });
        dice.roll();
        data.callback(dice);
      });
    });

    it('player1 token:0 and token:1 blocks player2 token:0', function(done) {

      game.once('token.blocked', function(data) {
        expect(data.token).to.eql(player2._tokens[0]);
        expect(data.blockade.tokens).to.eql([player1._tokens[0], player1._tokens[1]]);
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

      game.currentPlayersTurn = player2;

      game.once('player.turn.rollDice', function(data) {
        var dice = new Ludo.Dice({ rolled: 6 });
        dice.roll();
        data.callback(dice);
      });
    });

    it('player2 token:0 and token:1 blocks player1 token:0 from borning', function(done) {

      game.once('token.blocked', function(data) {
        expect(data.token).to.eql(player1._tokens[0]);
        expect(data.blockade.tokens).to.eql([player2._tokens[0], player2._tokens[1]]);
        done();
      });

      game.start();
    });

  });

});
