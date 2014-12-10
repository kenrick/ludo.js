var helper = require('./spec_helper');
var Token = require('../src/token');
var ActionTypes = require('../src/constants').ActionTypes;

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
      actions[0].should.eql({type: ActionTypes.BORN, token: token });
    });
  });
  describe("born", function() {
    it('sets active to true');
    it('calls moveTo with the startPoint coordinates');
    it('fires the token:born event');
  });
  describe("moveBy", function() {
    it('accepts a number to move the token by');
    it('calls moveTo with the coordinates that token should be at');
    it('returns the coordinates the token was moved to');
  });

  describe("moveTo", function() {
    it('fires the token:move event, passing the token and coordinates');
    it('updates the currentCoord with the new coordinates');
  });

  describe("killed", function() {
    it('sets active to false');
  });
});
