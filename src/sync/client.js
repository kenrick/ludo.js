var Events = require('../constants').Events;

module.exports = function(game, socket) {
  var events = [];
  var lastIndex = -1;

  function hasEvent(event, index) {
    return JSON.stringify(events[index]) === JSON.stringify(event);
  }

  function hasDiffEvent(event, index) {
    return JSON.stringify(events[index]) !== JSON.stringify(event);
  }

  socket.on('event', function(event, index) {
    if (events[index] === undefined) {
      var eventsLength = events.push(event);
      if (eventsLength === (index + 1)) {
        lastIndex = index;
        console.log('receiving', event.type, index);
        game.processEvent(event);
      }
    }
    // } else if (hasEvent(event, index)) {
    //   console.log('Already has data', event.type);
    // } else if (hasDiffEvent(event, index)) {
    //   console.log('Has different data', events, event, index);
    // }
  });

  return {
    send: function(event) {
      var eventsLength = events.push(event);
      var index = eventsLength - 1;
      lastIndex = index;

      console.log('sending', event.type, index);

      socket.emit('event', event, index);
    },
    setEvents: function(syncEvents) {
      // console.log(syncEvents);
      events = syncEvents || [];
    },
    alreadyHasEvent: function(event) {
      return hasEvent(event, lastIndex);
    }
  };

};
