import { updateState, findPossibleActions, diceRollAction } from './src/game';
import { createState } from './src/state';
import { partial } from 'lodash';

export function continueGame(state) {
  const getState = () => state;
  const nextActionType = () => state.get('nextActionType');
  const rollDice = diceRollAction(state.get('playerTurn'));
  const getPossibleActions = partial(findPossibleActions, state);
  const update = (action) => continueGame(updateState(state, action));

  return Object.freeze({
    getState,
    nextActionType,
    rollDice,
    getPossibleActions,
    update
  });
}

export function createGame({ playerCount }) {

  if (playerCount <= 0 || playerCount >= 5) {
    throw new Error('Cannot create game with the player count specified');
  }

  return continueGame(createState(playerCount));
}
