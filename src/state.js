import { Map, List } from 'immutable';
import { TEAMS } from './constants'
import { range, flatten } from 'lodash';

function generatePlayers(playerCount) {
  return range(playerCount).map((id) => (
    Map({ id: id, team: TEAMS[id] })
  ));
}

function generateTokens(playerCount) {
  return flatten(range(playerCount).map((id) => {
    const team = TEAMS[id];

    return range(4).map(() => (
      Map({ team: team, cord: List.of(0, 0), isActive: false, isAscended: false })
    ));
  })).map((token, id) => token.set('id', id));
}

export function initState(playerCount) {
  return Map({
    players: List(generatePlayers(playerCount)),
    tokens: List(generateTokens(playerCount)),
    actions: List(),
    playerTurn: 0,
    winner: undefined,
  });
}

