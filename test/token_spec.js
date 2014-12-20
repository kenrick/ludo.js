var helper = require('./spec_helper');
var Token = require('../src/token').Token;
var constants = require('../src/constants');
var ActionTypes = constants.ActionTypes;
var Grid = constants.Grid;

describe('Token', function() {
  var token;
  var token2;
  var player;
  var player2;
  var game;

  beforeEach(function() {
    player = helper.mockPlayer('Player1', 'bl');
    game = player.game;
    token = new Token({player: player, id: 0});
  });

  describe('intialize', function() {
    it('can accept the player it belongs to', function() {
      token.player.should.equal(player);
    });
    it('can accept its team', function() {
      token.team.should.equal('bl');
    });
  });

  describe('getPossibleActions', function() {
    it('returns the born action when rolled is 6', function() {
      token.active.should.equal(false);
      action = token.getPossibleAction(6);
      expect(action).to.eql({type: ActionTypes.BORN, token: token, rolled: 6, forecast: [7, 14]});
    });

    it('returns the move by action when rolled is 4 and already active', function() {
      token.born();
      action = token.getPossibleAction(4);
      expect(action).to.eql({type: ActionTypes.MOVE_BY, token: token, rolled: 4, forecast: [7, 10]});
    });

    it('returns the kill move action if there is a token in the forecast cord', function() {
      player2 = helper.mockPlayer('Player2', 'br');
      token2 = new Token({ player: player2, id: 0 });
      token.born();
      token.player.enemyTokenAt.returns(token2);
      action = token.getPossibleAction(4);
      expect(action).to.eql({type: ActionTypes.KILL_MOVE, token: token, enemyToken: token2, rolled: 4, forecast: [7, 10]});
    });

    it('returns the create blockade action if there is a ally token in the forecast cord', function() {
      token2 = new Token({ player: player, id: 1 });
      token.born();
      token.player.allyTokensAt.returns([token2]);
      action = token.getPossibleAction(4);
      expect(action).to.eql({type: ActionTypes.CREATE_BLOCKADE, token: token, allyTokens: [token2], rolled: 4, forecast: [7, 10]});
    });

    it('returns the ascending when forecast is on the acesndingPoint', function() {
      token2 = new Token({ player: player, id: 1 });
      token.born();
      token.moveTo({x: 8, y: 15});
      action = token.getPossibleAction(6);
      expect(action).to.eql({type: ActionTypes.ASCEND, token: token, rolled: 6, forecast: [8, 9]});
    });
  });
  describe('born', function() {
    it('sets active to true', function() {
      token.born();
      token.active.should.equal(true);
    });

    it('calls moveTo with the startPoint coordinates', function() {
      token.born();
      token.cords.x.should.equal(Grid.startPoint.bl[0]);
      token.cords.y.should.equal(Grid.startPoint.bl[1]);
    });
    it('fires the token.born event', function() {
      token.born();
      game.emit.should.be.calledWith('token.born', { token: token });
    });

    it('fires the token.moveTo event to startPoint', function() {
      token.born();
      cords = { x: Grid.startPoint.bl[0], y: Grid.startPoint.bl[1] };
      game.emit.should.be.calledWith('token.moveTo', { token: token, cords: cords });
    });
  });
  describe('moveBy', function() {
    it('accepts a number to move the token by', function() {
      token.born();
      token.moveBy(3);
      token.cords.x.should.equal(7);
      token.cords.y.should.equal(11);
    });

    it('resets at the end of the path', function() {
      token.born();
      token.moveTo({x: 7, y: 4});
      token.moveBy(3);
      token.cords.x.should.equal(7);
      token.cords.y.should.equal(1);
    });

    it('loops around the path when it reaches the end by 2', function() {
      token.born();
      token.moveTo({x: 7, y: 4});
      token.moveBy(5);
      token.cords.x.should.equal(9);
      token.cords.y.should.equal(1);
    });
  });

  describe('moveTo', function() {
    it('fires the token.moveTo event, passing the token and coordinates', function() {
      token.moveTo({x: 5, y: 15});
      game.emit.should.be.calledWith('token.moveTo', { token: token, cords: {x: 5, y: 15} });
    });

    it('updates the cords with the new coordinates', function() {
      token.moveTo({x: 5, y: 15});
      token.cords.x.should.equal(5);
      token.cords.y.should.equal(15);
    });
  });

  describe('createBlockade', function() {
    it('creates blockade if 1 or more tokens are at that cord', function() {
      token2 = new Token({ player: player, id: 1 });
      token.born();
      token._createBlockade([5, 9], [token2]);
      player.registerBlockade.should.be.calledWith([5, 9], [token2, token]);
    });

    it('fires token.blockade', function() {
      token2 = new Token({ player: player, id: 1 });
      token.born();
      token._createBlockade([5, 9], [token2]);

      game.emit.should.be.calledWith('token.blockade', { cords: [5, 9], tokens: [token2, token] });
    });
  });

  describe('findAllCordsAhead', function() {
    it('returns a list of cords ahead of a cord', function() {
      token.born();
      expect(token._findAllCordsAhead(3)).to.eql([[7, 13], [7, 12], [7, 11]]);
    });

    it('returns a list of cords ahead of a cord and wrapping Grid.path', function() {
      token.born();
      token.moveTo({x: 7, y: 4});
      expect(token._findAllCordsAhead(3)).to.eql([[7, 3], [7, 2], [7, 1]]);
    });

    it('returns a list of cords ahead of a cord move by 1', function() {
      token.born();
      token.moveTo({x: 7, y: 4});
      expect(token._findAllCordsAhead(1)).to.eql([[7, 3]]);
    });
  });

  describe('killedBy', function() {
    beforeEach(function() {
      player2 = helper.mockPlayer('Player2', 'br');
      token2 = new Token({ player: player2, id: 0 });
      token.born();
      token2.born();
      token.killedBy(token2);
    });

    it('sets active to false', function() {
      token.active.should.equal(false);
    });

    it('sets the token cords to x: 0 , y: 0', function() {
      token.cords.should.eql({ x: 0, y: 0 });
    });
  });

  describe('kill', function() {
    beforeEach(function() {
      player2 = helper.mockPlayer('Player2', 'br');
      token2 = new Token({ player: player2, id: 0 });
      token.born();
      token2.born();
    });

    it('calls killedBy on the token it lands on', function() {
      var spy = helper.sinon.spy();

      token2.killedBy = spy;
      token._kill(token2);

      token2.killedBy.calledOnce.should.equal(true);
    });

    it('fires token.killed with the killed and by', function() {
      token._kill(token2);
      game.emit.should.be.calledWith('token.killed', { killed: token2, by: token });
    });

  });
});
