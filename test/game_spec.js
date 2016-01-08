/* global define, it, describe */
import expect from 'expect';
import { processInput, update, render } from '../src/game';
import { createState, createAction } from '../src/state';
import { isFunction } from 'lodash';
import { List } from 'immutable';

describe('game module', () => {
  describe('processInput', () => {
    it('calls the input function with an object(type, roll, finder) and resolver', (done) => {
      processInput(createState(2), ({type, roll, finder }, cb) => {
        expect(type).toBe('dice roll');
        expect(isFunction(roll)).toBe(true);
        expect(isFunction(finder)).toBe(true);
        cb();
      }).then(done);
    });
  });

  describe('render', () => {
    it('takes a state passes it into the function passed into it', (done) => {
      render(createState(2), (state, cb) => {
        expect(state.equals(createState(2))).toBe(true);
        cb();
      }).then(done);
    });
  });

  describe('update', () => {
    it(`returns state with the turn changed when the dice roll
        action has no possible token actions`, () => {
      const action = createAction({ type: 'dice roll', rolled: List.of(1, 2), playerId: 0});
      const state = update(createState(2), action);
      expect(state.playerTurn).toEqual(1);

      const action2 = createAction({ type: 'dice roll', rolled: List.of(1, 2), playerId: 1});
      const state2 = update(state, action2);
      expect(state2.playerTurn).toEqual(0);
    });

  });
});
