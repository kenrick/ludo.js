var debug = require('debug')('ludo:game:client');

var constants = require('../constants');

var SyncEvents = constants.SyncEvents;
var Events = constants.Events;

module.exports = function(game, link) {
  var events = [];
  var client = null;

  function onClientJoin(payload) {
    var player = payload.player;
    game.joinGame(player.metadata);
  }

  function onRegisterDice(payload) {
    var event = { type: Events.REG_DICE, payload: payload };
    game.processEvent(event);
  }

  function onRegisterAction(payload) {
    var event = { type: Events.REG_ACTION, payload: payload };
    game.processEvent(event);
  }

  function onGameStart() {
    game.start();

    debug('game started');
  }

  link.on(SyncEvents.CLIENT_JOIN, onClientJoin);
  link.on(SyncEvents.START_GAME, onGameStart);
  link.on(SyncEvents.REG_DICE, onRegisterDice);
  link.on(SyncEvents.REG_ACTION, onRegisterAction);

  return {
    connect: function(callback) {
      link.emit(SyncEvents.CONNECT, function(clientData, gameState) {
        client = clientData;
        game.setState(gameState);

        if (client) game.localPlayer = client.player;

        if (callback) callback(true);

        debug('connected to game server');
      });
    },
    requestDice: function(callback) {
      link.emit(SyncEvents.DICE_ROLL, { clientId: client.id }, callback);
    },
    takeAction: function(action, dice) {
      var payload = {
        tokenId: action.token.id,
        dicePosition: action.dicePosition,
        team: action.token.team
      };
      link.emit(SyncEvents.TAKE_ACTION, payload);
    },
    addEvent: function(event) {
      var eventsLength = events.push(event);
      var index = eventsLength - 1;

      debug('add event(%s) index(%s)', event.type, index);
    },
    setEvents: function(syncEvents) {
      events = syncEvents || [];
    },
    getEvents: function() {
      return events;
    }
  };

};
