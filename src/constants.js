require('es5-shim');

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
