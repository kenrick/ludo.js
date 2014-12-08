var Ludo = require('../index');
var assign = require('object-assign');
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
    TestActuator = assign(new Ludo.Actuator(), {
      debug: true,

      handlePlayerAdded: helper.sinon.spy(),
      handleGameStart:   helper.sinon.spy(),
      handlePlayerTurn:  function(player, callback) {
        turnStart();
        dice = new Ludo.Dice({ rolled: 4 });
        player.rolled(dice);
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

  it('was called when the when a player\'s turn started on handlePlayerTurn', function() {
    expect(turnStart.called).to.equal(true);
  });


});
