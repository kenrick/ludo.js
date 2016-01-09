import { List } from 'immutable';
import { isUndefined } from 'lodash';
import { createAction } from './state.js';

export const DICE_ROLL = 'dice roll';
export const TOKEN_ACTION = 'token action';

export function nextActionType(action, playerTurn) {
  if(isUndefined(action)) {
    return DICE_ROLL;
  }

  const turnChanged = action.get('playerId') !== playerTurn;
  const isLastDie = () => action.getIn(['dice', 1]) === true;

  if(!isLastDie() && !turnChanged) {
    return TOKEN_ACTION;
  }

  return DICE_ROLL;
}

export function diceRollAction(playerTurn) {
  return (die) => (
    createAction({ type: DICE_ROLL, rolled: List(die), playerId: playerTurn })
  );
}
