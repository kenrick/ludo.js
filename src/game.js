import { PATH } from './constants';
import { nextActionType, diceRollAction } from './action';
import { flow } from 'lodash';

export function processInput(state, input) {
  const type = nextActionType(state.actions, state.playerTurn);
  const roll = diceRollAction(state.playerTurn);
  const finder = findPossibleActions(state);
  return new Promise((resolve, _) => {
    input({ type, roll, finder }, resolve);
  });
}

export function update(state, action) {
  let s = state
  //switch on action type
  //when dice roll
  //check for possible actions
  //if none exists
  //change turn
  s = changeTurn(s);
  //if 1 or more exists
  //add action to state and return new state
  //when token move
  //double check token can move
  //perform action
  //update state
  //return updated state
  return appendAction(action, s);
}

export function render(state, output) {
  return new Promise((resolve, _) => {
    output(state, resolve);
  });
}

function findPossibleActions(state) {
  // diceAction = state.get('actions')
  //   .findLast((action) => (
  //       action.get('playerId') === state.get('playerId')
  //         && action.get('type') === DICE_ROLL
  //   ));
  return () => {}
}

function changeTurn(state) {
  return state.set('playerTurn', nextPlayer(state.players.count(), state.playerTurn))
}

function nextPlayer(count, playerId) {
  const nextPlayerId = playerId + 1;

  if(count === nextPlayerId) {
    return 0;
  }

  return nextPlayerId;
}

function appendAction(action, state) {
  return state.updateIn(['actions'], (list) => list.push(action));
}
