import expect from 'expect';
import { fromJS, is, List } from 'immutable';
import { nextActionType, diceRollAction } from '../src/action';
import { createAction } from '../src/state';

describe('action module', () => {
  describe('nextActionType', () => {

    it('returns dice roll when the action is undefined', () => {
      expect(nextActionType(undefined, 0)).toBe('dice roll');
    });

    it('returns token action when the action is a dice roll', () => {
      const action = createAction({ type: 'dice roll', rolled: List([4]), playerId: 0 });
      expect(nextActionType(action, 0)).toBe('token action');
    });

    it('returns token action when the action is a token action and the turn did not change', () => {
      const action = createAction({ type: 'token action', verb: 'born', tokenId: 0, playerId: 0, dice: List([0, false]) });
      expect(nextActionType(action, 0)).toBe('token action');
    });

    it('returns dice roll when the player turn does not change', () => {
      const action = createAction({ type: 'token action', verb: 'born', tokenId: 0, playerId: 0, dice: List([0, true]) });
      expect(nextActionType(action, 0)).toBe('dice roll');
    });

    it('returns dice roll when the player turn changes without a token action', () => {
      const action = createAction({ type: 'dice roll', rolled: List([4]), playerId: 0 });
      expect(nextActionType(action, 1)).toBe('dice roll');
    });
  });

  describe('diceRollAction', () => {
    it('returns a function that generates a dice roll action', () => {
      const roll = diceRollAction(2);
      expect(is(roll([1, 6]), createAction({ type: 'dice roll', rolled: List([1, 6]), playerId: 2 }))).toBe(true);
      expect(is(roll([2]), createAction({ type: 'dice roll', rolled: List([2]), playerId: 2 }))).toBe(true);
    }); });
});
