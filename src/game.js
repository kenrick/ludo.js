import { nextActionType, diceRollAction } from './action';

function nextPlayer(count, playerId) {
  const nextPlayerId = playerId + 1;

  if(count === nextPlayerId) {
    return 0;
  }

  return nextPlayerId;
}

function changeTurn(state) {
  return state.set('playerTurn', nextPlayer(state.players.count(), state.playerTurn));
}

function findPossibleActions() {
  // diceAction = state.get('actions')
  //   .findLast((action) => (
  //       action.get('playerId') === state.get('playerId')
  //         && action.get('type') === DICE_ROLL
  //   ));
  return () => {};
}

function appendAction(action, state) {
  return state.updateIn(['actions'], (list) => list.push(action));
}

export function processInput(state, input) {
  // TODO: when there no possible actions for a dice and the turn
  // was no changed for a dice roll force the
  // next action type to be dice roll by setting it to undefined
  const action = state.actions.last();
  const type = nextActionType(action, state.playerTurn);
  const roll = diceRollAction(state.playerTurn);
  const finder = findPossibleActions(state);
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

