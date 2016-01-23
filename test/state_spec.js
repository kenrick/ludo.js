/* global define, it, describe */
import expect from 'expect';
import { createState } from '../src/state.js';
import { fromJS } from 'immutable';

describe('state module', () => {
  const state = createState(2);

  describe('createState', () => {
    it('should be reconstructable', () => {
      expect(fromJS(state.toJS()).equals(state)).toBe(true);
    });

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
      expect(state.get('winner')).toBe(undefined); // eslint-disable-line no-undefined
    });
  });
});
