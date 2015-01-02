var debug = require('debug')('ludo:game:client');

var SyncEvents = require('../constants').SyncEvents;

module.exports = function(game, link) {
  var events = [];
  var lastIndex = -1;
  var client = null;

  function onClientJoin(payload) {
    var player = payload.player;
    game.joinGame(player.metadata);
  }

  function onGameStart() {
    game.start();

    debug('game started');
  }

  link.on(SyncEvents.CLIENT_JOIN, onClientJoin);
  link.on(SyncEvents.START_GAME, onGameStart);

  return {
    connect: function(callback) {
      link.emit(SyncEvents.CONNECT, function(playerData, gameState) {
        client = playerData;
        game.setState(gameState);

        if (client) game.localPlayer = client;

        if (callback) callback(true);

        debug('connected to game server');
      });
    },
    addEvent: function(event) {
      var eventsLength = events.push(event);
      var index = eventsLength - 1;
      lastIndex = index;

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
