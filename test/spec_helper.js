var Ludo = {};
Ludo.Game = require('../lib/game').Game;
Ludo.Player = require('../lib/player').Player;


global.Ludo = Ludo;
global.chai = require('chai');
global.mocha = require('mocha');
global.should = chai.should();


