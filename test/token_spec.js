var helper = require('./spec_helper');
var Token = require('../src/token');
var constants = require('../src/constants');
var ActionTypes = constants.ActionTypes;
var Grid = constants.Grid;

describe("Token", function() {
  var token, player;

  beforeEach(function() {
    player = helper.mockPlayer("Player1");
    token = new Token({team: "bl", player: player, id: 0});
  });

  describe("intialize", function() {
    it('can accept the player it belongs to', function() {
      token.player.should.equal(player);
    });
    it('can accept its team', function() {
      token.team.should.equal("bl");
    });
  });

  describe("getPossibleActions", function() {
    it('returns the born action when rolled is 6', function() {
      token.active.should.equal(false);
      actions = token.getPossibleActions(6);
      actions[0].should.eql({type: ActionTypes.BORN, token: token, rolled: 6});
    });

    it('returns the move by action when rolled is 4 and already active', function() {
      token.born();
      actions = token.getPossibleActions(4);
      actions[0].should.eql({type: ActionTypes.MOVE_BY, token: token, rolled: 4});
    });
  });
  describe("born", function() {
    it('sets active to true', function() {
      token.born();
      token.active.should.equal(true);
    });
    it('calls moveTo with the startPoint coordinates', function() {
      token.born();
      token.cords.x.should.equal(Grid.startPoint.bl[0]);
      token.cords.y.should.equal(Grid.startPoint.bl[1]);
    });
    it('fires the token:born event');
  });
  describe("moveBy", function() {
    it('accepts a number to move the token by', function() {
        token.born();
        token.moveBy(3);
        token.cords.x.should.equal(7);
        token.cords.y.should.equal(11);
    });
    it('calls moveTo with the coordinates that token should be at');
    it('returns the coordinates the token was moved to');
  });

  describe("moveTo", function() {
    it('fires the token:move event, passing the token and coordinates');
    it('updates the cords with the new coordinates', function() {
      token.moveTo({x: 5, y: 15});
      token.cords.x.should.equal(5);
      token.cords.y.should.equal(15);
    });
  });

  describe("killed", function() {
    it('sets active to false');
  });
});
