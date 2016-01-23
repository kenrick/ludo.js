import { Map, List, Range } from 'immutable';
import { TEAMS, DICE_ROLL } from './constants';
import { assign } from 'lodash';

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
  return Range()
  .take(playerCount)
  .map((id) => (
    createPlayer({ id: id, team: TEAMS[id] })
  ));
}

function createTokens(playerCount) {
  return Range()
  .take(playerCount)
  .flatMap((id) => Range().take(4).map(() => createToken({ team: TEAMS[id] })))
  .map((token, id) => token.set('id', id));
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

