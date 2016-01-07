import { PATH } from './constants';
import { nextActionType, diceRollAction } from './action';

export function processInput(state, input) {
  const type = nextActionType(state.actions, state.playerTurn);
  const roll = diceRollAction(state.playerTurn);
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
  return state.updateIn(['actions'], (list) => list.push(action));
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
