import { DICE_ROLL, TOKEN_ACTION, nextActionType, diceRollAction } from './action';
import { createAction } from './state';
import { startPoint } from './grid';
import { partial, isUndefined } from 'lodash';

function nextPlayer(count, playerId) {
  const nextPlayerId = playerId + 1;

  if(count === nextPlayerId) {
    return 0;
  }

  return nextPlayerId;
}

function changeTurn(state) {
  return state.set('playerTurn', nextPlayer(state.get('players').size, state.get('playerTurn')));
}

function lastDiceAction(actions, playerId) {
  return actions.findLast((action) => (
    action.get('playerId') === playerId
      && action.get('type') === DICE_ROLL
  ));
}

function possibleActionFor(token, rolled) {
  if(token.get('active') === false && rolled === 6) {
    return createAction({
      type: TOKEN_ACTION,
      verb: 'born',
      moveToCoord: startPoint.get(token.get('team')),
      tokenId: token.get('id')
    });
  }
}

function findPossibleActions(state, dice) {
  const player = state.getIn(['players', state.get('playerTurn')]);
  const diceAction = lastDiceAction(state.get('actions'), state.get('playerTurn'));
  const rolled = diceAction.getIn(['rolled', dice]);

  return state.get('tokens')
    .filter((token) => token.get('team') === player.get('team'))
    .map((token) => possibleActionFor(token, rolled, state))
    .filterNot((action) => isUndefined(action));
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
  let s = state;
  // switch on action type
  switch(action.get('type')) {
  case 'dice roll':
    break;
  case 'token action':
    break;
  default:
    return s;
  }
  // when dice roll
  // check for possible actions
  // if none exists
  // change turn
  s = changeTurn(s);
  // if 1 or more exists
  // add action to state and return new state
  // when token move
  // double check token can move
  // perform action
  // update state
  // return updated state
  return appendAction(action, s);
}

export function render(state, output) {
  return new Promise((resolve) => {
    output(state, resolve);
  });
}

