import expect from 'expect';
import { createState } from '../src/state.js';

describe("state module", () => {
  const state = createState(2);

  describe("createState", () => {
    it('has same amount of players passed in', () => {
      expect(state.players.count()).toEqual(2);
    });

    it('has 4 tokens for each player', () => {
      expect(state.tokens.count()).toEqual(8);
    });

    it('the initial player turn is 0', () => {
      expect(state.playerTurn).toEqual(0);
    });

    it('has winner set to undefined', () => {
      expect(state.winner).toBe(undefined);
    });
  });
});
