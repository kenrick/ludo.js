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

      player1._tokens[1].createBlockade([7, 13], [player1._tokens[0]]);

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
        // console.log(player1);
        expect(player1._tokens[0].inBlockade).to.be.false();
        expect(player1._tokens[1].inBlockade).to.be.false();
        plan.ok();
      });

      game.start();
    });

  });

});
