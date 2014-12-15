var chai = exports.chai = require('chai');
var sinonChai = exports.sinonChai = require('sinon-chai');
var sinon = exports.sinon = require('sinon');
var Player = require('../src/player');
exports.should = chai.should();
chai.use(sinonChai);

// Helper functions
exports.mockGame = function() {
  return {
    on: sinon.spy(),
    emit: sinon.spy(),
    continueGame: sinon.spy()
  };
};

exports.mockPlayer = function(name, team) {
  return {
    name: name,
    team: team,
    getReady: sinon.stub().returns(true),
    beginTurn: sinon.spy(),
    setTeam: sinon.spy(),
    joinGame: sinon.spy(),
    game: exports.mockGame()
  };
};
