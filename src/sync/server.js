var debug = require('debug')('ludo:game:server');

var constants = require('../constants');
var Dice = require('../dice').Dice;
var md5 = require('MD5');

var SyncEvents = constants.SyncEvents;
var Events = constants.Events;

module.exports = function(game) {
  var clients = [];
  var eventList = [];
  var lastIndex = -1;

  function encrypt(object) {
    return md5(JSON.stringify(object));
  }

  function emitToAll(event, payload, ignore) {
    clients.forEach(function(client) {
      if (ignore && ignore.id === client.id) return;
      client.link.emit(event, payload);
    });

    debug('sent to all clients: event(%s)', event);
  }

  function addClient(link, player) {
    var client = {
      id: encrypt(player.metadata),
      player: player,
      link: link
    };

    client.link.on(SyncEvents.CONNECT, function(callback) {
      debug('new client connected');
      callback({id: client.id, player: player}, game.state());
    });

    client.link.on(SyncEvents.DICE_ROLL, function(payload) {
      var dices = [new Dice(), new Dice()];

      dices.forEach(function(dice) {
        dice.roll();
      });

      debug('rolled dice for client');
      payload.callback(dices[0], dices[1]);
      //register dice in the game
      registerDice({ dices: dices, player: client.player }, client);
    });

    clients.push(client);
    emitToAll(SyncEvents.CLIENT_JOIN, { player: player }, client);
  }

  function registerDice(payload, client) {
    var event = { type: Events.REG_DICE, payload: payload };
    game.processEvent(event);
    emitToAll(SyncEvents.REG_DICE, payload, client);
  }

  function onGameStart() {
    debug('game started');
    emitToAll(SyncEvents.START_GAME);
  }

  game.on(Events.GAME_START, onGameStart);

  return {
    addClient: addClient,
    getClients: function() {
      return clients;
    },
    getEvents: function() {
      return eventList.slice(0);
    },
    addEvent: function(event) {
      var eventsLength = eventList.push(event);
      var index = eventsLength - 1;

      debug('add event(%s) index(%s)', event.type, index);
    }
  };
};
