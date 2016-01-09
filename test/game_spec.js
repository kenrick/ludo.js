/* global define, it, describe */
import expect, { createSpy } from 'expect';
import { processInput, update, render } from '../src/game';
import { createState, createAction } from '../src/state';
import { isFunction } from 'lodash';
import { List } from 'immutable';

function spyArgs(spy) {
  return spy.calls[0].arguments;
}

describe('game module', () => {
  describe('processInput', () => {
    it('calls the input function with an object(type, roll, finder) and resolver', () => {
      const spy = createSpy();
      processInput(createState(2), spy);

      const {type, roll, finder} = spyArgs(spy)[0];
      expect(type).toBe('dice roll');
      expect(isFunction(roll)).toBe(true);
      expect(isFunction(finder)).toBe(true);
    });

    it('predicts the next action and provides possible actions if there are any', () => {
      const spy = createSpy();
      const state = createState(2).updateIn(['actions'], (list) => {
        return list.push(createAction({
          type: 'dice roll',
          rolled: List.of(6),
          playerId: 0
        }));
      });
      processInput(state, spy);

      const {type, finder} = spyArgs(spy)[0];
      expect(type).toBe('token action');
      expect(finder(0).first().get('verb')).toBe('born');
      expect(finder(0).first().get('moveToCoord').equals(List.of(7, 14))).toBe(true);
      expect(finder(0).first().get('tokenId')).toBe(0);
      expect(finder(0).count()).toBe(4);
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
      expect(state.get('playerTurn')).toEqual(1);

      const action2 = createAction({ type: 'dice roll', rolled: List.of(1, 2), playerId: 1});
      const state2 = update(state, action2);
      expect(state2.get('playerTurn')).toEqual(0);
    });

  });
});
