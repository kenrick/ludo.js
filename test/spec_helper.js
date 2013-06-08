var Ludo = {};
Ludo.Emitter = require('../src/emitter').Emitter;
Ludo.Game = require('../src/game').Game;
Ludo.Player = require('../src/player').Player;
Ludo.Dice = require('../src/dice').Dice;



global.Ludo = Ludo;
global.chai = require('chai');
global.sinonChai = require("sinon-chai");
global.mocha = require('mocha');
global.sinon = require('sinon');
global.should = chai.should();
chai.use(sinonChai);


