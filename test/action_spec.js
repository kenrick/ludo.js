import expect from 'expect';
import { fromJS, is } from 'immutable';
import { nextActionType, diceRollAction } from '../src/action';

describe('action module', () => {
  describe('nextActionType', () => {

    it('returns dice roll when the action List is empty', () => {
      const actions = fromJS([]);
      expect(nextActionType(actions, 0)).toBe('dice roll');
    });

    it('returns token action when the last action', () => {
      const actions = fromJS([{ type: 'dice roll', rolled: [4], playerId: 0 }]);
      expect(nextActionType(actions, 0)).toBe('token action');
    });

    it('returns dice roll when the player turn does not change', () => {
      const actions = fromJS([
          { type: 'dice roll', rolled: [6], playerId: 0 },
          { type: 'token action', intent: 'born', tokenId: 0 },
      ]);
      expect(nextActionType(actions, 0)).toBe('dice roll');
    });

    it('returns dice roll when the player turn changes without a token action', () => {
      const actions = fromJS([{ type: 'dice roll', rolled: [4], playerId: 0 }]);
      expect(nextActionType(actions, 1)).toBe('dice roll');
    });
  });

  describe('diceRollAction', () => {

    it('returns a function that generates a dice roll action', () => {
      const roll = diceRollAction(2);
      expect(is(roll([1, 6]), fromJS({ type: 'dice roll', rolled: [1, 6], playerId: 2 }))).toBe(true);
      expect(is(roll([2]), fromJS({ type: 'dice roll', rolled: [2], playerId: 2 }))).toBe(true);
    });
  });
});
