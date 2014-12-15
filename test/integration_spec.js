var Ludo = require('../index');
var helper = require('./spec_helper');

describe('Integration', function() {
  var game;
  var player;
  var player2;
  var player3;
  var player4;

  describe('Player2 kills Player1\'s token', function() {

    beforeEach(function() {
      game = new Ludo.Game();
      player1 = new Ludo.Player({name: 'P1'});
      player2 = new Ludo.Player({name: 'P2'});

      player1.readyUp();
      player2.readyUp();

      game.addPlayer(player1);
      game.addPlayer(player2);

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
        data.actions[0].type.should.equal('killMove');
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

});
