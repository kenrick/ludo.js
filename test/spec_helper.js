var chai = exports.chai = require('chai');
var sinonChai = exports.sinonChai = require("sinon-chai");
var sinon = exports.sinon = require('sinon');
exports.should = chai.should();
chai.use(sinonChai);

// Helper functions
exports.mockPlayer = function(name) {
  return {
    name: name,
    isReady: sinon.stub().returns(true),
    beginTurn: sinon.spy(),
    setTeam: sinon.spy(),
    joinGame: sinon.spy()
  };
};
