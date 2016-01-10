import { DICE_ROLL, TOKEN_ACTION, nextActionType, diceRollAction } from './action';
import { createAction } from './state';
import { startPoint, path, switchCoords, heaven } from './grid';
import { nextCoordsFrom } from './coordinate';
import { flow, partial, isUndefined } from 'lodash';
import { List } from 'immutable';

function nextPlayer(count, playerId) {
  const nextPlayerId = playerId + 1;

  if(count === nextPlayerId) {
    return 0;
  }

  return nextPlayerId;
}

function lastDiceAction(actions, playerId) {
  return actions.findLast((action) => (
    action.get('playerId') === playerId
      && action.get('type') === DICE_ROLL
  ));
}

function changeTurn(state) {
  const diceAction = lastDiceAction(state.get('actions'), state.get('playerTurn'));
  const rolledAnySixes = diceAction.get('rolled').some((dice) => dice === 6);

  if(rolledAnySixes) {
    return state;
  }

  return state.set('playerTurn', nextPlayer(state.get('players').size, state.get('playerTurn')));
}

// TODO: Check is this is last usable dice in a diceAction
function isLastDice() {
  return true;
}

function findEnemyTokenAtCoord(tokens, team, coord) {
  return tokens
    .filter((token) => token.get('team') !== team)
    .find((token) => token.get('coord').equals(coord));
}

function isMultipleTokensAt(tokens, coords) {
  return tokens
    .groupBy((t) => t.get('coord'))
    .filter((ts) => ts.count() >= 2)
    .some((ts) => coords.includes(ts.first().get('coord')));
}

function isPathBlockedFor(token, tokens, coords) {
  return tokens
    .filter((t) => t.get('team') !== token.get('team'))
    .groupBy((t) => t.get('team'))
    .some((ts) => isMultipleTokensAt(ts, coords));
}

function possibleActionFor({token, dice, diceAction, tokens}) {
  const rolled = diceAction.getIn(['rolled', dice]);
  const canBorn = token.get('active') === false && rolled === 6;
  const heavenPath = heaven.get(token.get('team'));

  if(!canBorn && token.get('active') !== true) {
    return;
  }

  const action = {
    type: TOKEN_ACTION,
    tokenId: token.get('id'),
    dice: List.of(dice, isLastDice()),
    verbs: List()
  };
  let moveToCoord;
  let verbs = List();
  let coords;

  if(canBorn) {
    verbs = verbs.push('born');
    coords = List([startPoint.get(token.get('team'))]);
  }

  if(token.get('active') === true) {
    coords = nextCoordsFrom({
      path,
      alternate: heavenPath,
      switchCoord: switchCoords.get(token.get('team')),
      next: rolled,
      fromCoord: token.get('coord')
    });
  }

  if(isPathBlockedFor(token, tokens, coords)) {
    return;
  }

  moveToCoord = coords.last();
  const enemyToken = findEnemyTokenAtCoord(tokens, token.get('team'), moveToCoord);

  if(heavenPath.last().equals(moveToCoord)) {
    verbs = verbs.push('ascend');
  }

  if(!isUndefined(enemyToken)) {
    verbs = verbs.push('kill');
    action.killedTokenId = enemyToken.get('id');
  }

  action.verbs = verbs.push('move');
  action.moveToCoord = moveToCoord;
  return createAction(action); // eslint-disable-line
}

function findPossibleActions(state, dice) {
  const player = state.getIn(['players', state.get('playerTurn')]);
  const diceAction = lastDiceAction(state.get('actions'), state.get('playerTurn'));
  const tokens = state.get('tokens');

  return tokens
    .filter((token) => token.get('team') === player.get('team'))
    .map((token) => possibleActionFor({token, dice, diceAction, tokens}))
    .filterNot((action) => isUndefined(action));
}

function actionPerformers(verb) {
  const performers = {
    'born'(action, state) {
      return state.setIn(['tokens', action.get('tokenId'), 'active'], true);
    },
    'kill'(action, state) {
      return state.setIn(['tokens', action.get('killedTokenId'), 'active'], false)
        .setIn(['tokens', action.get('killedTokenId'), 'coord'], List.of(0, 0));
    },
    'ascend'(action, state) {
      return state.setIn(['tokens', action.get('tokenId'), 'active'], false)
        .setIn(['tokens', action.get('tokenId'), 'ascend'], true);
    },
    'move'(action, state) {
      return state.setIn(['tokens', action.get('tokenId'), 'coord'], action.get('moveToCoord'));
    }
  };

  return performers[verb];
}

function performAction(action, state) {
  if(action.get('type') !== TOKEN_ACTION) {
    return state;
  }

  return action
    .get('verbs')
    .reduce((prevState, verb) => actionPerformers(verb)(action, prevState), state);
}

function appendAction(action, state) {
  return state.updateIn(['actions'], (list) => list.push(action));
}

export function processInput(state, input) {
  // TODO: when there no possible actions for a dice and the turn
  // was no changed for a dice roll force the
  // next action type to be dice roll by setting it to undefined
  const action = state.get('actions').last();
  const type = nextActionType(action, state.get('playerTurn'));
  const roll = diceRollAction(state.get('playerTurn'));
  const finder = partial(findPossibleActions, state);
  return new Promise((resolve) => {
    input({ type, roll, finder }, resolve);
  });
}

export function update(state, action) {
  return flow(
    partial(performAction, action),
    partial(appendAction, action),
    changeTurn
  )(state);
}

export function render(state, output) {
  return new Promise((resolve) => {
    output(state, resolve);
  });
}

