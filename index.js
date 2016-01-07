import { processInput, update, render } from './src/game';
import { createState } from './src/state';
import { TEAMS } from './src/constants';

function loop({state, input, output}) {
  processInput(state, input).then( action => {
    const updatedState = update(state, action);
    render(updatedState, output).then(() => {
      loop({state: updatedState, input, ouput});
    });
  });
}

export function createGame(spec) {
  const { playerCount, input, output } = spec;

  if (playerCount <= 0 || playerCount >= 5) {
    throw('Cannot create game with the player count specified');
  }

  return loop({state: createState(playerCount), input, output});
}

export function continueGame(state, spec) {
  const { input, output } = spec;
  return loop({state, input, output});
}
