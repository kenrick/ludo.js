import { Map, List, Record } from 'immutable';
import { TEAMS } from './constants';
import { range, flatten } from 'lodash';

const Player = Record({
  id: Number,
  team: String
});

const Token = Record({
  id: Number,
  team: String,
  coord: List.of(0, 0),
  active: false,
  ascended: false
});

const State = Record({
  players: List(),
  tokens: List(),
  actions: List(),
  playerTurn: 0,
  winner: undefined
});

function createRecord(record, spec = {}) {
  return new record(spec);
}

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

export function createAction(spec) {
  return Map(spec);
}

export function createState(playerCount) {
  return createRecord(State, {
    players: List(createPlayers(playerCount)),
    tokens: List(createTokens(playerCount)),
  });
}

