import { Map, List } from 'immutable';
import { TEAMS } from './constants';
import { range, flatten, assign } from 'lodash';
import { DICE_ROLL } from './action'

function createPlayer(spec) {
  return Map(spec);
}

function createToken(spec) {
  return Map(assign({
    coord: List.of(0, 0),
    active: false,
    ascend: false
  }, spec));
}

function createPlayers(playerCount) {
  return range(playerCount).map((id) => (
    createPlayer({ id: id, team: TEAMS[id] })
  ));
}

function createTokens(playerCount) {
  return flatten(range(playerCount).map((id) => (
    range(4).map(() => createToken({ team: TEAMS[id] }))
  ))).map((token, id) => token.set('id', id));
}

export function createAction(spec) {
  return Map(spec);
}

export function createState(playerCount) {
  return Map({
    players: List(createPlayers(playerCount)),
    tokens: List(createTokens(playerCount)),
    nextActionType: DICE_ROLL,
    actions: List(),
    playerTurn: 0,
    winner: undefined, // eslint-disable-line no-undefined
  });
}

