import { Map, List, Record } from 'immutable';
import { TEAMS } from './constants'
import { range, flatten } from 'lodash';

const Player = Record({
  id: undefined,
  team: undefined
});

const Token = Record({
  id: undefined,
  team: undefined,
  coord: List.of(0, 0),
  active: false,
  ascended: false
});

const Action = Record({
  type: undefined,
  playerId: undefined,
});

const State = Record({
  players: List(),
  tokens: List(),
  actions: List(),
  playerTurn: 0,
  winner: undefined
});

function createPlayers(playerCount) {
  return range(playerCount).map((id) => (
    createRecord(Player, { id: id, team: TEAMS[id] })
  ));
}

function createTokens(playerCount) {
  return flatten(range(playerCount).map((id) => (
    range(4).map(() => createRecord(Token, { team: TEAMS[id] }))
  ))).map((token, id) => token.set('id', id));
}

function createRecord(record, spec = {}) {
  return new record(spec);
}

export function createAction(spec) {
  return createRecord(Action, spec);
}

export function createState(playerCount) {
  return createRecord(State, {
    players: List(createPlayers(playerCount)),
    tokens: List(createTokens(playerCount)),
  });
}

