var Events = require('../constants').Events;

module.exports = function(game) {
  var sockets = [];
  var events = [];
  var lastIndex = -1;

  function hasEvent(event, index) {
    return JSON.stringify(events[index]) === JSON.stringify(event);
  }

  function hasDiffEvent(event, index) {
    return JSON.stringify(events[index]) !== JSON.stringify(event);
  }

  return {
    addSocket: function(socket) {
      socket.on('event', function(event, index) {
        if (events[index] === undefined) {
          console.log('receiving', event.type, index);
          game.processEvent(event);
        }
      });

      sockets.push(socket);
    },
    getSockets: function() {
      return sockets;
    },
    getEvents: function() {
      return events;
    },
    send: function(event) {
      var eventsLength = events.push(event);
      var index = eventsLength - 1;

      console.log('sending', event.type, index);

      sockets.forEach(function(socket) {
        socket.emit('event', event, index);
      });
    },
    alreadyHasEvent: function(event) {
      return false;
    }
  };
};
