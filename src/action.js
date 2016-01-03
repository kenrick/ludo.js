import { List, Map } from 'immutable'

const DICE_ROLL = 'dice roll';
const TOKEN_ACTION = 'token action';

export function nextActionType(actions, playerTurn) {
  if(actions.isEmpty()) {
    return DICE_ROLL;
  }

  const lastAction = actions.last();
  const actionTypeEq = type => lastAction.get('type') === type
  const turnChanged = () => lastAction.get('playerId') !== playerTurn

  if(turnChanged() || actionTypeEq(TOKEN_ACTION)) {
    return DICE_ROLL;
  }
  else {
    return TOKEN_ACTION;
  }
}

export function diceRollAction(playerTurn) {
  return (die) => (
    Map({ type: DICE_ROLL, rolled: List(die), playerId: playerTurn })
  )
}

export function findPossibleActions(state) {
  return (dice) => {
  }
}
