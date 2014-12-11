!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Ludo=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.Game = require("./src/game");
exports.Player = require("./src/player");
exports.Token = require("./src/token");
exports.Dice = require("./src/dice");
exports.Actuator = require("./src/actuator");

},{"./src/actuator":4,"./src/dice":6,"./src/game":7,"./src/player":8,"./src/token":9}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],4:[function(require,module,exports){
var assign = require('object-assign');

function Actuator() {
  this.debug = false;
}

Actuator.build = function(actuator) {
  return assign(new Actuator(), actuator);
};

Actuator.prototype.log = function() {
  if(this.debug) console.log.apply(console, arguments);
};

Actuator.prototype.handlePlayerAdded = function(player) {
  this.log("Player Joined", player);
};

Actuator.prototype.handleNotEnoughReadyPlayers = function() {
  this.log("Not all players are ready to start the game");
};

Actuator.prototype.handleGameStart = function() {
  this.log("Game Started");
};

Actuator.prototype.handlePlayerDiceRoll = function(player, callback) {
  this.log("handlePlayerDiceRoll requires implementation");
};

Actuator.prototype.handlePlayerActionDecision = function(player, actions, callback) {
  this.log("handlePlayerActionDecision requires implementation");
};

Actuator.prototype.handleTokenBorn = function(token) {
  this.log(token, "is now active");
};

Actuator.prototype.handleTokenMoveTo = function(token, cords) {
  this.log(token, "moved To", cords);
};

module.exports = Actuator;

},{"object-assign":3}],5:[function(require,module,exports){
/**
Conversions;
 RED    = BL
 BLUE   = BR
 YELLOW = TR
 GREEN  = TL
**/

exports.Teams = ['bl', 'br', 'tl', 'tr'];

exports.ActionTypes = {
		BORN: 		'born',
		MOVE_BY:  'moveBy',
};

exports.Grid = {
	path: [
	  [7, 1],
    [8, 1],
    [9, 1],
		[9, 2],
		[9, 3],
		[9, 4],
		[9, 5],
		[9, 6],
		[10, 7],
		[11, 7],
		[12, 7],
		[13, 7],
		[14, 7],
		[15, 7],
		[15, 8],
		[15, 9],
		[14, 9],
		[13, 9],
		[12, 9],
		[11, 9],
		[10, 9],
		[9, 10],
		[9, 11],
		[9, 12],
		[9, 13],
		[9, 14],
		[9, 15],
		[8, 15],
		[7, 15],
		[7, 14],
		[7, 13],
		[7, 12],
		[7, 11],
		[7, 10],
		[6, 9],
		[5, 9],
		[4, 9],
		[3, 9],
		[2, 9],
		[1, 9],
		[1, 8],
		[1, 7],
		[2, 7],
		[3, 7],
		[4, 7],
		[5, 7],
		[6, 7],
		[7, 6],
		[7, 5],
		[7, 4],
		[7, 3],
		[7, 2],
  ],
	center: [
		[7, 7],
		[8, 7],
		[9, 7],
		[7, 8],
	  [8, 8],
	  [9, 8],
	  [7, 9],
	  [8, 9],
	  [9, 9],
  ],
	heaven: {
		bl: [
			[8,14],
			[8,13],
			[8,12],
			[8,11],
			[8,10],
    ],
		br: [
		  [14,8],
		  [13,8],
		  [12,8],
		  [11,8],
		  [10,8],
    ],
		tl: [
			[2,8],
			[3,8],
			[4,8],
			[5,8],
			[6,8],
    ],
		tr: [
			[8,2],
			[8,3],
			[8,4],
			[8,5],
			[8,6],
    ]
  },
	startPoint: {
    bl: [7, 14],
    br: [14, 9],
    tr: [9, 2],
    tl: [2, 7],
  },
  teamAreas: {
		tl: [1, 1],
		tr: [10, 1],
		bl: [1, 10],
		br: [10, 10],
  }
};

},{}],6:[function(require,module,exports){
function Dice(options) {
  this.options = (options || {});
  this.rolled = this.options.rolled || false;
}

Dice.prototype.roll = function() {
  if(this.rolled === false) {
    this.rolled = Math.floor( 6 * Math.random() ) + 1;
  }

  return this.rolled;
};

module.exports = Dice;

},{}],7:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var Actuator = require('./actuator');
var constants = require('./constants');

function Game(options) {

  this.options = (options || {});
  this.actuator = this.options.actuator || (new Actuator());
  this.players = [];
  this.started = false;
  this.events = (new EventEmitter());
  this.attachEvents(this.options.events);
  this.currentPlayersTurn = false;
}

Game.prototype.attachEvents = function (events) {
  if(typeof events !== "undefined") {
    for(var e in events) {
      this.events.on(e, events[e]);
    }
  }
};

Game.prototype.addPlayer = function (player) {
  if(this.players.length <= 3) {
    player.joinGame(this);
    player.setTeam(constants.Teams[this.players.length]);
    this.players.push(player);
    this.actuator.handlePlayerAdded(player);
  }
};

Game.prototype.start = function() {
  if(!this.started) {
    var readies = 0;

    for (var i = 0; i < this.players.length; i++) {
      if(this.players[i].isReady()) {
        readies++;
      }
    }

    if(this.players.length <= 0 || this.players.length != readies) {
      this.actuator.handleNotEnoughReadyPlayers();
      this.started = false;
    }
    else {
      this.started = true;
      this.events.emit("game:started");
      this.actuator.handleGameStart();
      this.loop();
    }
  }
};

Game.prototype.loop = function() {
  //Calls the next players turn in line.
  var player = this.nextPlayersTurn();
  this.invokeTurn(player);
};

Game.prototype.continueGame = function() {
  this.loop();
};

Game.prototype.invokeTurn = function(player) {
  this.currentPlayersTurn = player;
  return player.beginTurn();
};

Game.prototype.nextPlayersTurn = function() {
  var nextPlayer;
  if(this.currentPlayersTurn) {
    var playerIndex = this.players.indexOf(this.currentPlayersTurn);
    if(playerIndex !== this.players.length - 1) {
      nextPlayer = this.players[playerIndex + 1];
    }
    else {
      nextPlayer = this.players[0];
    }
  }
  else {
    nextPlayer = this.players[0];
  }
  return nextPlayer;
};


module.exports = Game;

},{"./actuator":4,"./constants":5,"events":2}],8:[function(require,module,exports){
var Token = require('./token');

function Player(metadata) {
  this.metadata = metadata;
  this.readied = false;
  this.game = false;
  this.team = false;
  this.tokens = [];
}

Player.prototype.setTeam = function(team) {
  this.team = team;
  this.createTokensForTeam();
};

Player.prototype.createTokensForTeam = function() {
  for (var i = 0; i <= 3; i++) {
    this.tokens.push(new Token({player: this, team: this.team, id: i}));
  }
};

Player.prototype.ready = function() {
  this.readied = true;
};

Player.prototype.isReady = function() {
  return this.readied;
};

Player.prototype.getActionsByDice = function(dice) {
  var rolled = dice.rolled;
  var possibleActions = this.generatePossibleActions(rolled);

  if(possibleActions.length !== 0) {
    this.game.actuator.handlePlayerActionDecision(this, possibleActions, this.executeAction.bind(this));
  }
  else {
    this.endTurn();
  }
};

Player.prototype.beginTurn = function() {
  this.game.events.emit("player:turn:begins", this);
  this.game.actuator.handlePlayerDiceRoll(this, this.getActionsByDice.bind(this));
};

Player.prototype.generatePossibleActions = function(rolled) {
  var actions, totalActions = [];
  for (var i = 0; i <= 3; i++) {
    actions = this.tokens[i].getPossibleActions(rolled);

    totalActions = totalActions.concat(actions);
  }
  return totalActions;
};

Player.prototype.executeAction = function(action) {
  action.token.executeAction(action);
  this.endTurn();
};

Player.prototype.endTurn = function() {
  this.game.events.emit("player:turn:end", this);
  this.game.continueGame();
};

Player.prototype.joinGame = function(game) {
  this.game = game;
  this.game.events.emit("player:joined");
  return true;
};

module.exports = Player;

},{"./token":9}],9:[function(require,module,exports){
var constants = require('./constants');
var Grid = constants.Grid;
var ActionTypes = constants.ActionTypes;
var utils = require('./utils');

function Token(options) {
  this.player = options.player;
  this.game   = this.player.game;
  this.team   = options.team;
  this.id     = options.id;
  this.active = false;
  this.cords  = {x: 0, y: 0};
}

Token.prototype.getPossibleActions = function(rolled) {
  var actions = [];

  if(this.active) {
    actions.push({type: ActionTypes.MOVE_BY, token: this, rolled: rolled});
  }
  else {
    if(rolled === 6) {
      actions.push({type: ActionTypes.BORN, token: this, rolled: rolled});
    }
  }

  return actions;
};

Token.prototype.executeAction = function(action) {

  switch (action.type) {
  case ActionTypes.BORN:
      this.born();
    break;

  case ActionTypes.MOVE_BY:
    this.moveBy(action.rolled);
    break;
  }
};

Token.prototype.born = function() {
  var startPoint = Grid.startPoint[this.team];
  this.active = true;
  this.game.actuator.handleTokenBorn(this);

  this.moveTo({x: startPoint[0], y: startPoint[1]});
};

Token.prototype.moveBy = function(rolled) {
  cordArray = [this.cords.x, this.cords.y];
  index = utils.findCordsInArray(cordArray, Grid.path);
  index += rolled;
  if(index > (Grid.path.length - 1) ) {
    index -= (Grid.path.length);
  }
  newCord = Grid.path[index];
  this.moveTo({x: newCord[0], y: newCord[1]});
};


Token.prototype.moveTo = function(cords) {
  this.cords = cords;
  this.game.actuator.handleTokenMoveTo(this, this.cords);
};

module.exports = Token;

},{"./constants":5,"./utils":10}],10:[function(require,module,exports){
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

exports.findCordsInArray = function(needle, haystack) {
  return haystack.findIndex(function(e, index) {
    if(e[0] == needle[0] && e[1] == needle[1] ) return 1;
  });
};

},{}]},{},[1])(1)
});