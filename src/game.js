import { DICE_ROLL, TOKEN_ACTION, nextActionType, diceRollAction } from './action';
import { createAction } from './state';
import { startPoint, path, switchCoords, heaven } from './grid';
import { nextCoordsFrom } from './coordinate'
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

function possibleActionFor({token, dice, diceAction}) {
  const rolled = diceAction.getIn(['rolled', dice]);

  if(token.get('active') === false && rolled === 6) {
    return createAction({
      type: TOKEN_ACTION,
      verb: 'born',
      moveToCoord: startPoint.get(token.get('team')),
      tokenId: token.get('id'),
      dice: List.of(dice, isLastDice())
    });
  }

  if(token.get('active') === true) {
    const coords = nextCoordsFrom({
      path,
      alternate: heaven,
      switchCoord: switchCoords.get(token.get('team')),
      next: rolled,
      fromCoord: token.get('coord')
    });

    return createAction({
      type: TOKEN_ACTION,
      verb: 'move',
      moveToCoord: coords.last(),
      tokenId: token.get('id'),
      dice: List.of(dice, isLastDice())
    });
  }
}

function findPossibleActions(state, dice) {
  const player = state.getIn(['players', state.get('playerTurn')]);
  const diceAction = lastDiceAction(state.get('actions'), state.get('playerTurn'));

  return state.get('tokens')
    .filter((token) => token.get('team') === player.get('team'))
    .map((token) => possibleActionFor({token, dice, diceAction}))
    .filterNot((action) => isUndefined(action));
}

function performAction(action, state) {
  if(action.get('type') !== TOKEN_ACTION) {
    return state;
  }

  return state
    .updateIn(['tokens', action.get('tokenId')], (token) => {
      let t = token;

      if(action.get('verb') === 'born') {
        t = t.set('active', true);
      }

      return t.set('coord', action.get('moveToCoord'));
    });
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

