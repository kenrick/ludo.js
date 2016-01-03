import expect from 'expect';
import { initState } from '../src/state.js';

describe("state module", () => {
  const state = initState(2);

  describe("initState", () => {
    it('has same amount of players passed in', () => {
      expect(state.get('players').count()).toEqual(2);
    });

    it('has 4 tokens for each player', () => {
      expect(state.get('tokens').count()).toEqual(8);
    });

    it('the initial player turn is 0', () => {
      expect(state.get('playerTurn')).toEqual(0);
    });

    it('has winner set to undefined', () => {
      expect(state.get('winner')).toBe(undefined);
    });
  });
});
