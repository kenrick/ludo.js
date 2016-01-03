import { processInput, update, render } from './src/game';
import { initState } from './src/state';
import { TEAMS } from './src/constants';

function initLoop(spec) {
  const { initialState, input, render } = spec;

  const loop = async function(state) {
    const action = await processInput(state, input);
    const updatedState = update(state, action);
    await render(updatedState, renderer);

    if (updatedState.get('winner') === undefined) {
      return loop(updatedGame);
    }
  };

  return loop(initialState);
}

export function createGame(spec) {
  const { playerCount, input, renderer } = spec;

  if (playerCount <= 0 || playerCount >= 5) {
    throw('Cannot create game with the player count specified');
  }

  const initialState = initState(playerCount);
  return initLoop({initialState, input, renderer});
}
