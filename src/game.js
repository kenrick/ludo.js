import { DICE_ROLL, TOKEN_ACTION } from './constants';
import { createAction } from './state';
import { startPoint, path, switchCoords, heaven } from './grid';
import { nextCoordsFrom } from './coordinate';
import { flow, partial, isUndefined } from 'lodash';
import { List } from 'immutable';

function diceRollAction(playerTurn) {
  return (die) => (
    createAction({ type: DICE_ROLL, rolled: List(die), playerId: playerTurn })
  );
}

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

function isAlreadyUsed(dice, diceAction, actions) {
  if(actions.last().equals(diceAction)) {
    return false;
  }

  const reverseActions = actions.reverse();

  return reverseActions
    .take(reverseActions.indexOf(diceAction))
    .some((action) => action.get('dice') === dice);
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

function possibleActionFor({token, dice, diceAction, state}) {
  const rolled = diceAction.getIn(['rolled', dice]);
  const canBorn = token.get('active') === false && rolled === 6;
  const heavenPath = heaven.get(token.get('team'));
  const tokens = state.get('tokens');

  if(!canBorn && token.get('active') !== true || token.get('ascend') === true) {
    return;
  }

  const action = {
    type: TOKEN_ACTION,
    tokenId: token.get('id'),
    verbs: List(),
    dice
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

  if(coords.includes(undefined) || isPathBlockedFor(token, tokens, coords)) { // eslint-disable-line
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
    .map((token) => possibleActionFor({token, dice, diceAction, state}))
    .filterNot((action) => isUndefined(action));
}

function anyPossibleActions(diceAction, state) {
  return diceAction
    .get('rolled')
    .keySeq()
    .filterNot((key) => isAlreadyUsed(key, diceAction, state.get('actions')))
    .some(((key) => !findPossibleActions(state, key).isEmpty()));
}

function changeTurnAndAction(state) {
  const diceAction = lastDiceAction(state.get('actions'), state.get('playerTurn'));
  const rolledAnySixes = diceAction.get('rolled').some((dice) => dice === 6);

  if(anyPossibleActions(diceAction, state)) {
    return state.set('nextActionType', TOKEN_ACTION);
  }

  if(rolledAnySixes && !anyPossibleActions(diceAction, state)) {
    return state.set('nextActionType', DICE_ROLL);
  }

  return state
    .set('playerTurn', nextPlayer(state.get('players').size, state.get('playerTurn')))
    .set('nextActionType', DICE_ROLL);
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

  return action.get('verbs')
    .reduce((prevState, verb) => actionPerformers(verb)(action, prevState), state);
}

function appendAction(action, state) {
  return state.updateIn(['actions'], (list) => list.push(action));
}

function checkForWinner(state) {
  const winningTeam = state.get('tokens')
    .groupBy((token) => token.get('team'))
    .filter((teamTokens) => (
      teamTokens.every((token) => token.get('ascend'))
    ))
    .first();

  if(isUndefined(winningTeam)) {
    return state;
  }

  const winner = state.get('players')
    .find((player) => player.get('team') === winningTeam.first().get('team'));

  return state.set('winner', winner.get('id'));
}

function validateAction(action, state) {
  if(action.get('type') !== state.get('nextActionType')) {
    throw new Error('Unexpected action type');
  }

  if(action.get('type') === TOKEN_ACTION) {
    const possibleActions = findPossibleActions(state, action.get('dice'));
    if(!possibleActions.includes(action)) {
      throw new Error('Impossible action provided');
    }
  }

  return state;
}

function updateState(state, action) {
  return flow(
    partial(validateAction, action),
    partial(performAction, action),
    partial(appendAction, action),
    changeTurnAndAction,
    checkForWinner
  )(state);
}

export { updateState, findPossibleActions, diceRollAction };
