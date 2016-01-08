/* global define, it, describe */
import expect from 'expect';
import { createGame } from '../index';

describe('ludo game', () => {
  it('returns a dice roll action for the first action type', (done) => {
    let action; // undefined
    createGame({
      playerCount: 2,
      input({ type, roll, finder }, i) {
        expect(type).toEqual('dice roll');
        action = roll([1, 2]);
        i(action);
      },
      output(state) {
        expect(state.get('actions').last().equals(action)).toBe(true);
        done();
      }
    });
  });
});
