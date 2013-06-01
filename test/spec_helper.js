var Ludo = {};
Ludo.Emitter = require('../lib/emitter').Emitter;
Ludo.Game = require('../lib/game').Game;
Ludo.Player = require('../lib/player').Player;



global.Ludo = Ludo;
global.chai = require('chai');
global.sinonChai = require("sinon-chai");
global.mocha = require('mocha');
global.sinon = require('sinon');
global.should = chai.should();
chai.use(sinonChai);


