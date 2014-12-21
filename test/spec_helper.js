var chai = exports.chai = require('chai');
var sinonChai = exports.sinonChai = require('sinon-chai');
var sinon = exports.sinon = require('sinon');
var Player = require('../src/player');
exports.should = chai.should();
global.expect = chai.expect;
chai.use(sinonChai);

// Helper functions
exports.mockGame = function() {
  return {
    on: sinon.spy(),
    emit: sinon.spy(),
    continueGame: sinon.spy(),
    findTokenAt: sinon.spy(),
    registerBlockade: sinon.spy(),
    anyBlockadeIn: sinon.spy()
  };
};

exports.mockPlayer = function(name, team) {
  return {
    name: name,
    team: team,
    getReady: sinon.stub().returns(true),
    blockadeAhead: sinon.stub().returns(false),
    registerBlockade: sinon.spy(),
    enemyTokenAt: sinon.stub().returns(false),
    tokenLocatedAt: sinon.stub().returns(false),
    allyTokensAt: sinon.stub().returns(false),
    allTokensAscended: sinon.stub().returns(false),
    beginTurn: sinon.spy(),
    setTeam: sinon.spy(),
    joinGame: sinon.spy(),
    game: exports.mockGame()
  };
};

function Plan(count, done) {
  this.done = done;
  this.count = count;
}

Plan.prototype.ok = function() {

  this.count--;

  if (this.count === 0) {
    this.done();
  }
};

exports.plan = function(count, done) {
  return new Plan(count, done);
};
