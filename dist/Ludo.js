!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Ludo=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.Game = require('./src/game').Game;
exports.Player = require('./src/player').Player;
exports.Token = require('./src/token').Token;
exports.Dice = require('./src/dice').Dice;
exports.utils = require('./src/utils');

},{"./src/dice":8,"./src/game":9,"./src/player":10,"./src/token":11,"./src/utils":12}],2:[function(require,module,exports){
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
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
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

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"_process":4,"inherits":3}],7:[function(require,module,exports){
/**
Conversions;
 RED    = BL
 BLUE   = BR
 YELLOW = TR
 GREEN  = TL
**/

exports.Teams = ['bl', 'br', 'tr', 'tl'];

exports.Messages = {
};

exports.Events = {
  GAME_START:      'game.start',
  GAME_WON:        'game.won',

  PLAYER_JOIN:     'player.join',
  TURN_BEGIN:      'player.turn.begin',
  TURN_END:        'player.turn.end',
  DICE_ROLL:       'player.turn.rollDice',
  REPEAT_TURN:     'player.turn.repeat',
  PLAYER_ACTIONS:  'player.actions',

  TOKEN_BORN:      'token.born',
  TOKEN_MOVE_TO:   'token.moveTo',
  TOKEN_KILLED:    'token.killed',
  TOKEN_BLOCKADE:  'token.blockade',
  TOKEN_BLOCKED:   'token.blocked',
  TOKEN_ASCEND:    'token.ascend',
  OVER_SHOOT:      'token.overShotAscension',

  ERROR:           'error'
};

exports.ActionTypes = {
  BORN:            'born',
  MOVE_BY:         'moveBy',
  KILL_MOVE:       'killMove',
  CREATE_BLOCKADE: 'createBlockade',
  ASCEND:          'ascend'
};

var Grid = exports.Grid = {
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
    [7, 2]
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
    [9, 9]
  ],
  switchPoint: {
    bl: [8, 15],
    br: [15, 8],
    tr: [8, 1],
    tl: [1, 8]
  },
  ascendingPoint: {
    bl: [8, 9],
    br: [9, 8],
    tr: [8, 7],
    tl: [7, 8]
  },
  heaven: {
    bl: [
      [8, 14],
      [8, 13],
      [8, 12],
      [8, 11],
      [8, 10]
    ],
    br: [
      [14, 8],
      [13, 8],
      [12, 8],
      [11, 8],
      [10, 8]
    ],
    tl: [
      [2, 8],
      [3, 8],
      [4, 8],
      [5, 8],
      [6, 8]
    ],
    tr: [
      [8, 2],
      [8, 3],
      [8, 4],
      [8, 5],
      [8, 6]
    ]
  },
  startPoint: {
    bl: [7, 14],
    br: [14, 9],
    tr: [9, 2],
    tl: [2, 7]
  },
  teamAreas: {
    tl: _listTeamAreaFrom([1, 1]),
    tr: _listTeamAreaFrom([10, 1]),
    bl: _listTeamAreaFrom([1, 10]),
    br: _listTeamAreaFrom([10, 10])
  },
  allCordsForTeam: {},
  allCordsForHeaven: {}
};

for (var i = 0; i <= 3; i++) {
  t = exports.Teams[i];
  exports.Grid.allCordsForTeam[t] = [Grid.startPoint[t]]
    .concat(Grid.heaven[t])
    .concat(Grid.teamAreas[t]);

  exports.Grid.allCordsForHeaven[t] = [Grid.switchPoint[t]]
  .concat(Grid.heaven[t])
  .concat([Grid.ascendingPoint[t]]);
}

function _listTeamAreaFrom(c) {
  var area = [];
  for (var y = c[1]; y <= c[1] + 5; y++) {
    for (var x = c[0]; x <= c[0] + 5; x++) {
      area.push([x, y]);
    }
  }

  return area;
}

},{}],8:[function(require,module,exports){
function Dice(options) {
  this.options = (options || {});
  this.rolled = this.options.rolled || false;
}

exports.Dice = Dice;

Dice.prototype.roll = function() {
  if (this.rolled === false) {
    this.rolled = Math.floor(6 * Math.random()) + 1;
  }

  return this.rolled;
};

},{}],9:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var constants = require('./constants');
var Events = constants.Events;
var inherits = require('util').inherits;

function Game(options) {
  this.options = (options || {});
  this.players = [];
  this.started = false;
  this.currentPlayersTurn = false;

  EventEmitter.call(this);
  this._attachEvents(this.options.events);
}

inherits(Game, EventEmitter);

exports.Game = Game;

Game.prototype._attachEvents = function _attachEvents(events) {
  var event;

  if (typeof events !== undefined) {
    for (event in events) {
      this.on(event, events[event]);
    }
  }
};

Game.prototype.addPlayer = function addPlayer(player) {
  if (this.players.length <= 3) {
    player.joinGame(this);
    player.setTeam(constants.Teams[this.players.length]);

    this.players.push(player);
    this.emit(Events.PLAYER_JOIN, { player: player });
  }
};

Game.prototype.start = function start() {
  var readies = 0;
  var i;

  if (!this.started) {

    for (i = 0; i < this.players.length; i++) {
      if (this.players[i].getReady()) {
        readies++;
      }
    }

    if (!this.players.length) {
      this.emit(Events.ERROR, { message: 'Not enough players to start game' });
    } else if (this.players.length != readies) {
      this.emit(Events.ERROR, { message: 'Not all players are ready' });
    } else {
      this.started = true;
      this.emit(Events.GAME_START);
      this._loop();
    }
  }

  return this;
};

Game.prototype._loop = function _loop() {
  var playerWon = this.playerTokensAscended();

  if (playerWon) {
    this.emit(Events.GAME_WON, { player: playerWon });
  } else {
    //Calls the next players turn in line.
    var player = this.nextPlayersTurn();
    this.invokeTurn(player);
  }

};

Game.prototype.continueGame = function continueGame() {
  this._loop();
};

Game.prototype.invokeTurn = function invokeTurn(player) {
  this.currentPlayersTurn = player;
  return player.beginTurn();
};

Game.prototype.nextPlayersTurn = function nextPlayersTurn() {
  var nextPlayer;

  if (this.currentPlayersTurn) {
    var playerIndex = this.players.indexOf(this.currentPlayersTurn);
    if (playerIndex !== this.players.length - 1) {
      nextPlayer = this.players[playerIndex + 1];
    } else {
      nextPlayer = this.players[0];
    }
  }
  else {
    nextPlayer = this.players[0];
  }
  return nextPlayer;
};

Game.prototype.findTokenAt = function findTokenAt(cords, excludedPlayer) {
  var players = this.players;
  var token;
  var i;

  for (i = 0; i < players.length; i++) {
    player = players[i];

    if (excludedPlayer !== undefined && player.team === excludedPlayer.team) {
      continue;
    }

    token = player.tokenLocatedAt(cords);

    if (token) return token;
  }

  return false;
};

Game.prototype.playerTokensAscended = function playerTokensAscended() {
  var players = this.players;
  var token;
  var i;

  for (i = 0; i < players.length; i++) {
    player = players[i];

    if (player.allTokensAscended()) return player;
  }

  return false;
};

Game.prototype.anyBlockadeIn = function anyBlockadeIn(cords, excludedPlayer) {
  var players = this.players;
  var blockade;
  var i;

  for (i = 0; i < players.length; i++) {
    player = players[i];

    if (excludedPlayer !== undefined && player.team === excludedPlayer.team) {
      continue;
    }

    blockade = player.hasBlockadeAt(cords);

    if (blockade) return blockade;
  }

  return false;
};

},{"./constants":7,"events":2,"util":6}],10:[function(require,module,exports){
var constants = require('./constants');
var Token = require('./token').Token;
var Events = constants.Events;

function Player(metadata) {
  this.metadata = metadata;
  this._ready = false;
  this.game = false;
  this.team = false;
  this._tokens = [];
  this.blockades = {};
}

exports.Player = Player;

Player.build = function() {

};

Player.prototype.setTeam = function setTeam(team) {
  this.team = team;
  this.createTokensForTeam();
};

Player.prototype.createTokensForTeam = function createTokensForTeam() {
  var id;

  for (id = 0; id <= 3; id++) {
    this._tokens.push(new Token({player: this, id: id}));
  }
};

Player.prototype.readyUp = function readyUp() {
  this.ready = true;
};

Player.prototype.getReady = function getReady() {
  return this.ready;
};

Player.prototype.getActionsByDice = function getActionsByDice(dice) {
  var _this = this;
  var rolled = dice.rolled;
  var possibleActions = this.generatePossibleActions(rolled);

  if (possibleActions.length) {
    this.game.emit(Events.PLAYER_ACTIONS, {
      player: this,
      actions: possibleActions,
      callback: function(action) {
        _this.executeAction(action);
      }
    });
  }
  else {
    this.endTurn();
  }
};

Player.prototype.beginTurn = function beginTurn() {
  var _this = this;
  this.game.emit(Events.TURN_BEGIN, { player: this });
  this.game.emit(Events.DICE_ROLL, {
    player: this,
    callback: function(dice) {
      _this.getActionsByDice(dice);
    }
  });
};

Player.prototype.generatePossibleActions = function generatePossibleActions(rolled) {
  var action;
  var totalActions = [];
  var i;

  for (i = 0; i <= 3; i++) {
    action = this._tokens[i].getPossibleAction(rolled);

    if (action) totalActions.push(action);
  }

  return totalActions;
};

Player.prototype.executeAction = function executeAction(action) {
  action.token.executeAction(action);

  if (action.rolled === 6) {
    this.game.emit(Events.REPEAT_TURN, { player: this });

    this.beginTurn();
  } else {
    this.endTurn();
  }

};

Player.prototype.endTurn = function endTurn() {
  this.game.emit(Events.TURN_END, { player: this });
  this.game.continueGame();
};

Player.prototype.joinGame = function joinGame(game) {
  this.game = game;
  return true;
};

Player.prototype.registerBlockade = function registerBlockade(cords, tokens) {
  if (tokens.length >= 2) {
    this.blockades[cords] = {tokens: tokens};

    for (i = 0; i < tokens.length; i++) {
      tokens[i].inBlockade = true;
    }
  } else {
    if (tokens[0] !== undefined) tokens[0].inBlockade = false;
    delete this.blockades[cords];
  }
};

Player.prototype.allTokensAscended = function allTokensAscended() {
  var tokens = [];
  var token;
  var count = 0;

  for (i = 0; i < this._tokens.length; i++) {
    token = this._tokens[i];
    if (token.ascended) count++;
  }

  return count === this._tokens.length;
};

Player.prototype.allyTokensAt = function allyTokensAt(cords, excludedToken) {
  var tokens = [];
  var token;

  for (i = 0; i < this._tokens.length; i++) {
    token = this._tokens[i];

    if (excludedToken !== undefined && token.id === excludedToken.id) {
      continue;
    }

    if (token.cords.x === cords[0] && token.cords.y === cords[1]) {
      tokens.push(token);
    }
  }

  if (!tokens.length) return false;

  return tokens;
};

Player.prototype.hasBlockadeAt = function hasBlockadeAt(cordsArray) {
  var i;
  var cords;

  for (i = 0; i < cordsArray.length; i++) {
    cords = cordsArray[i];
    if (this.blockades[cords] !== undefined) {
      return this.blockades[cords];
    }
  }

  return false;
};

Player.prototype.tokenLocatedAt = function tokenLocatedAt(cords, excludedToken) {
  var token;
  var i;

  for (i = 0; i < this._tokens.length; i++) {
    token = this._tokens[i];

    if (excludedToken !== undefined && token.id === excludedToken.id) {
      continue;
    }

    if (token.cords.x === cords[0] && token.cords.y === cords[1]) {
      return token;
    }
  }

  return false;
};

Player.prototype.blockadeAhead = function blockadeAhead(cordsArray) {
  return this.game.anyBlockadeIn(cordsArray, this);
};

Player.prototype.enemyTokenAt = function enemyTokenAt(cords) {
  return this.game.findTokenAt(cords, this);
};

},{"./constants":7,"./token":11}],11:[function(require,module,exports){
var constants = require('./constants');
var Grid = constants.Grid;
var ActionTypes = constants.ActionTypes;
var Events = constants.Events;
var utils = require('./utils');

function Token(options) {
  this.player = options.player;
  this.id     = options.id;
  this.game   = this.player.game;
  this.team   = this.player.team;

  this.active = false;
  this.isOnHeavenPath = false;
  this.inBlockade = false;
  this.cords  = {x: 0, y: 0};
  this.ascended = false;
}

exports.Token = Token;

Token.prototype.getPossibleAction = function getPossibleAction(rolled) {
  var action = {};
  var forecast;
  var enemyToken;
  var allyToken;
  var blockadeAhead;
  var overShootAscendingPoint;
  var willAscend;

  forecast = this._forecastCords(rolled);
  blockadeAhead = this._blockadeAhead(rolled);
  overShootAscendingPoint = this._willOverShootAscendingPoint(rolled);

  if (!blockadeAhead && !overShootAscendingPoint && !this.ascended) {
    action.forecast = forecast;
    action.token = this;
    action.rolled = rolled;

    if (this.active) {
      enemyToken = this.player.enemyTokenAt(forecast);
      allyTokens = this.player.allyTokensAt(forecast, this);
      willAscend = this._willAscend(forecast);

      if (willAscend) {
        action.type = ActionTypes.ASCEND;
      } else if (enemyToken) {
        action.type = ActionTypes.KILL_MOVE;
        action.enemyToken = enemyToken;
      } else if (allyTokens) {
        action.type = ActionTypes.CREATE_BLOCKADE;
        action.allyTokens = allyTokens;
      } else {
        action.type = ActionTypes.MOVE_BY;
      }
    } else if (rolled === 6) {
      action.type = ActionTypes.BORN;
    }

    if (action.type) return action;
  }

  return false;
};

Token.prototype.executeAction = function executeAction(action) {

  switch (action.type) {
  case ActionTypes.BORN:
    this.born();
    break;

  case ActionTypes.MOVE_BY:
  case ActionTypes.CREATE_BLOCKADE:
  case ActionTypes.KILL_MOVE:
  case ActionTypes.ASCEND:
    this.moveTo({x: action.forecast[0], y: action.forecast[1]});
    break;
  }
};

Token.prototype.born = function born() {
  var startPoint = Grid.startPoint[this.team];
  this.active = true;
  this.game.emit(Events.TOKEN_BORN, { token: this });

  this.moveTo({x: startPoint[0], y: startPoint[1]});
};

Token.prototype._forecastCords = function _forecastCords(rolled) {
  var cordArray = [this.cords.x, this.cords.y];
  var cordsAhead = this._findAllCordsAhead(rolled);
  var path = Grid.path;
  var switchToHeaven;
  var index;
  var cords;

  if (this.active) {
    switchToHeaven = utils.findCordsInArray(Grid.switchPoint[this.team], cordsAhead);

    if (this.isOnHeavenPath) {
      path = Grid.allCordsForHeaven[this.team];
    }

    if (switchToHeaven !== -1 && switchToHeaven !== (cordsAhead.length - 1)) {
      cords = this._switchToHeavenPath((switchToHeaven + 1), cordsAhead.length);
    } else {
      index = utils.findCordsInArray(cordArray, path);
      index += rolled;
      if (index > (path.length - 1)) {
        index -= (path.length);
      }
      cords = path[index];
    }
  } else if (rolled === 6) {
    cords = Grid.startPoint[this.team];
  }

  return cords;
};

Token.prototype._findAllCordsAhead = function _findAllCordsAhead(rolled) {
  var cordArray = [this.cords.x, this.cords.y];
  var initialIndex;
  var endingIndex;
  var cordsList = [];

  if (this.active) {
    initialIndex = utils.findCordsInArray(cordArray, Grid.path);
    endingIndex = initialIndex + rolled;
    initialIndex += 1; //Excludes first element in slice
    endingIndex += 1; //Includes last element in slice

    cordsList = Grid.path.slice(initialIndex, endingIndex);

    if (endingIndex > (Grid.path.length - 1)) {
      endingIndex -= (Grid.path.length);
      cordsList = cordsList.concat(Grid.path.slice(0, endingIndex));
    }
  } else if (rolled === 6) {
    cordsList = [Grid.startPoint[this.team]];
  }

  return cordsList;
};

Token.prototype._blockadeAhead = function _blockadeAhead(rolled) {
  var blockade = this.player.blockadeAhead(this._findAllCordsAhead(rolled));

  if (blockade) {
    this.game.emit(Events.TOKEN_BLOCKED, { token: this, blockade: blockade });
  }

  return blockade;
};

Token.prototype._willAscend = function _willAscend(cords) {
  return cords === Grid.ascendingPoint[this.team];
};

Token.prototype._willOverShootAscendingPoint = function _willOverShootAscendingPoint(rolled) {
  var totalHeavenPath = Grid.allCordsForHeaven[this.team];
  var cordArray = [this.cords.x, this.cords.y];
  var index = utils.findCordsInArray(cordArray, totalHeavenPath);
  index += 1;
  var exactRolled = totalHeavenPath.length - index;
  var diff;

  if (this.isOnHeavenPath && rolled > exactRolled) {
    diff = rolled - exactRolled;
    this.game.emit(Events.OVER_SHOOT, { token: this, by: diff });
    return true;
  }

  return false;
};

Token.prototype._createBlockade = function _createBlockade(cords, allyTokens) {
  allyTokens.push(this);
  this.player.registerBlockade(cords, allyTokens);
  this.game.emit(Events.TOKEN_BLOCKADE, { tokens: allyTokens, cords: cords });
};

Token.prototype._switchToHeavenPath = function _switchToHeavenPath(intialIndex, cordArrayLength) {
  var heavenPath = Grid.heaven[this.team];
  var cordsArray;
  var cords;

  cords = heavenPath[(cordArrayLength - 1) - intialIndex];

  return cords;
};

//TODO: Remove this function no longer in use
Token.prototype.moveBy = function moveBy(rolled) {
  var newCord = this._forecastCords(rolled);
  this.moveTo({x: newCord[0], y: newCord[1]});
};

Token.prototype.moveTo = function moveTo(cords) {
  var cordArray = [cords.x, cords.y];
  var enemyToken = this.player.enemyTokenAt(cordArray);
  var allyTokens = this.player.allyTokensAt(cordArray, this);
  var onHeavenPath = this._onHeavenPath(cordArray);
  var ascendCord = Grid.ascendingPoint[this.team];

  if (this.inBlockade) this._leaveBlockade();
  if (enemyToken) this._kill(enemyToken);
  if (allyTokens) this._createBlockade(cordArray, allyTokens);

  if (onHeavenPath) this.isOnHeavenPath = true;
  if (cordArray[0] === ascendCord[0] && cordArray[1] === ascendCord[1]) {
    this._ascend();
  }

  this.cords.x = cords.x;
  this.cords.y = cords.y;
  this.game.emit(Events.TOKEN_MOVE_TO, { token: this, cords: this.cords});
};

Token.prototype._leaveBlockade = function _leaveBlockade() {
  var cords = [this.cords.x, this.cords.y];
  var allyTokens;
  this.inBlockade = false;
  allyTokens = this.player.allyTokensAt(cords, this);
  this.player.registerBlockade(cords, allyTokens);
};

Token.prototype._ascend = function _ascend() {
  this.ascended = true;
  this.game.emit(Events.TOKEN_ASCEND, { token: this });
};

Token.prototype._onHeavenPath = function _onHeavenPath(cords) {
  var totalHeavenPath = Grid.allCordsForHeaven[this.team];
  var index = utils.findCordsInArray(cords, totalHeavenPath);

  return index !== -1;
};

Token.prototype.killedBy = function killedBy(otherToken) {
  this.active = false;
  this.cords = { x: 0, y: 0 };
};

Token.prototype._kill = function _kill(killedToken) {
  killedToken.killedBy(this);
  this.game.emit(Events.TOKEN_KILLED, { killed: killedToken, by: this });
};

},{"./constants":7,"./utils":12}],12:[function(require,module,exports){
var constants = require('./constants');
var Grid = constants.Grid;
var Teams = constants.Teams;

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

var findCordsInArray = exports.findCordsInArray = function(needle, haystack) {
  return haystack.findIndex(function(e, index) {
    if (e[0] == needle[0] && e[1] == needle[1]) {
      return 1;
    }
  });
};

exports.cordBelongsTo = function(cordArray) {
  for (var i = 0; i <= 3; i++) {
    if (findCordsInArray(cordArray, Grid.allCordsForTeam[Teams[i]]) !== -1) {
      return Teams[i];
    }
  }

  return false;
};

},{"./constants":7}]},{},[1])(1)
});