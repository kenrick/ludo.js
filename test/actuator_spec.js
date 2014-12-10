var Ludo = require('../index');
var helper = require('./spec_helper');
var expect = helper.chai.expect;
var turnStart = helper.sinon.spy();
var TestActuator, game;
var stubPlayer = function(name) {
  var player = new Ludo.Player({ name: name });
  player.ready();
  return player;
};

describe("Acutator", function() {

  beforeEach(function() {
    TestActuator = Ludo.Actuator.build({
      debug: true,

      handlePlayerAdded: helper.sinon.spy(),
      handleGameStart:   helper.sinon.spy(),
      handlePlayerDiceRoll: function(player, callback) {
        if(player.team === "bl") {
          turnStart();
          dice = new Ludo.Dice({ rolled: 6 });
          callback(dice);
        }
      },
      handlePlayerActionDecision: function(player, actions, callback) {

      },
    });


    game = new Ludo.Game({ actuator: TestActuator });
    game.addPlayer(stubPlayer("Player1"));
    game.addPlayer(stubPlayer("Player2"));
    game.addPlayer(stubPlayer("Player3"));
    game.addPlayer(stubPlayer("Player4"));

    game.start();
  });

  it('was called 4 times on handlePlayerAdded', function() {
    expect(TestActuator.handlePlayerAdded.callCount).to.equal(4);
  });

  it('was called when the game started on handleGameStart', function() {
    expect(TestActuator.handleGameStart.calledOnce).to.equal(true);
  });

  it('was called when a player\'s turn started on handlePlayerTurn', function() {
    expect(turnStart.called).to.equal(true);
  });


});
