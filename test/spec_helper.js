var Ludo = require("../index");

global.Ludo = Ludo;
global.chai = require('chai');
global.sinonChai = require("sinon-chai");
global.mocha = require('mocha');
global.sinon = require('sinon');
global.should = chai.should();
chai.use(sinonChai);

// Helper functions
global.mockPlayer = function(name) {
  return {
    name: name,
    isReady: sinon.stub().returns(true),
    beginTurn: sinon.spy(),
    joinGame: sinon.spy()
  };
};
