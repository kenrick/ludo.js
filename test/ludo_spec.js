/* global define, it, describe */
import expect from 'expect';
import { createGame } from '../index';
import { random, isUndefined } from 'lodash';

describe('ludo game', () => {
  it('returns a dice roll action for the first action type', () => {
    const game = createGame({ playerCount: 2 });
    expect(game.nextActionType()).toEqual('dice roll');

    const action = game.rollDice([1, 2]);
    const newGame = game.update(action);

    expect(newGame.getState().get('actions').last().equals(action)).toBe(true);
  });

  it('plays an entire game and stops when there is a winner', function test() {
    this.timeout(10000);
    let game = createGame({ playerCount: 4 });
    let winner = false;

    while(!winner) {
      let action;
      if(game.nextActionType() === 'dice roll') {
        action = game.rollDice([random(1, 6)]);
      }
      else {
        const actions = game.getPossibleActions(0);
        action = actions.get(random(actions.count() - 1));
      }

      game = game.update(action);
      if(!isUndefined(game.getState().get('winner'))) {
        winner = true;
      }
    }
  });
});
