import { PATH } from './constants';
import { findPossibleActions, nextActionType, diceRollAction } from './actions';

export function processInput(state, input) {
  const type = nextActionType(state.get('actions'), state.get('playerTurn'));
  const roll = diceRollAction(state.get('playerTurn'));
  const finder = findPossibleActions(state);
  return new Promise((resolve, _) => {
    input({ type, roll, finder }, resolve);
  });
}

export function update(state, action) {
  //switch on action type
  //when dice roll
  //check for possible actions
  //if none exists
  //change turn
  //if 1 or more exists
  //add action to state and return new state
  //when token move
  //double check token can move
  //perform action
  //update state
  //return updated state
}

export function render(state, callback) {
  return new Promise((resolve, _) => {
    callback(game, resolve);
  });
}
