/* global define, it, describe */
import expect from 'expect';
import { updateState, findPossibleActions, diceRollAction } from '../src/game';
import { createState, createAction } from '../src/state';
import { List, fromJS, is } from 'immutable';

describe('game module', () => {
  describe('findPossibleActions', () => {
    it('predicts the born action when a six is rolled', () => {
      const state = createState(2).mergeDeep(fromJS({
        actions: [{ type: 'dice roll', rolled: [6], playerId: 0}],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(action.get('verbs').toJS()).toEqual(['born', 'move']);
      expect(action.get('moveToCoord').equals(List.of(7, 14))).toBe(true);
      expect(action.get('tokenId')).toBe(0);
      expect(action.get('dice')).toBe(0);
      expect(actions.count()).toBe(4);
    });

    it('predicts the token move action when there active tokens', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [7, 14] }],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(actions.count()).toBe(1);
      expect(action.get('verbs').toJS()).toEqual(['move']);
      expect(action.get('moveToCoord').equals(List.of(6, 9))).toBe(true);
      expect(action.get('tokenId')).toBe(0);
    });

    it('predicts the token kill move action when there is an enemy token at the moveToCoord', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [
          { active: true, coord: [7, 14] }, {}, {}, {},
          { active: true, coord: [6, 9] }
        ],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(actions.count()).toBe(1);
      expect(action.get('verbs').toJS()).toEqual(['kill', 'move']);
      expect(action.get('moveToCoord').equals(List.of(6, 9))).toBe(true);
      expect(action.get('tokenId')).toBe(0);
      expect(action.get('killedTokenId')).toBe(4);
    });

    it('predicts the token move action when there active tokens', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [7, 14] }],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(actions.count()).toBe(1);
      expect(action.get('verbs').toJS()).toEqual(['move']);
      expect(action.get('moveToCoord').equals(List.of(6, 9))).toBe(true);
      expect(action.get('tokenId')).toBe(0);
    });

    it('predicts the token ascend move action when there active tokens', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [8, 15] }],
        actions: [{ type: 'dice roll', rolled: [6], playerId: 0}],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(action.get('verbs').toJS()).toEqual(['ascend', 'move']);
      expect(action.get('moveToCoord').equals(List.of(8, 9))).toBe(true);
      expect(action.get('tokenId')).toBe(0);
    });

    it('does not return an action for a token that is blocked', () => {
      const state = createState(2).mergeDeep(fromJS({
        playerTurn: 1,
        tokens: [
          { active: true, coord: [8, 15] }, { active: true, coord: [8, 15] }, {}, {},
          { active: true, coord: [9, 13]}
        ],
        actions: [{ type: 'dice roll', rolled: [1, 4], playerId: 1 }],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(action.get('verbs').toJS()).toEqual(['move']);
      expect(action.get('moveToCoord').equals(List.of(9, 14))).toBe(true);
      expect(action.get('tokenId')).toBe(4);

      expect(findPossibleActions(state, 1).isEmpty()).toBe(true);
    });

    it('does not return an action for a token on heavenPath if roll is too much to ascend', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [
          { active: true, coord: [8, 10] },
        ],
        actions: [{ type: 'dice roll', rolled: [1, 2], playerId: 0 }],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(action.get('verbs').toJS()).toEqual(['ascend', 'move']);
      expect(findPossibleActions(state, 1).isEmpty()).toBe(true);
    });

    it('perdicts if another action is possible for a dice', () => {
      const state = createState(2).mergeDeep(fromJS({
        actions: [{ type: 'dice roll', rolled: [6, 1], playerId: 0 }],
        nextActionType: 'token action'
      }));

      const actions = findPossibleActions(state, 0);
      const action = actions.first();

      expect(action.get('verbs').toJS()).toEqual(['born', 'move']);
      expect(action.get('dice')).toEqual(0);
      expect(findPossibleActions(state, 1).isEmpty()).toBe(true);
    });
  });

  describe('updateState', () => {
    it(`returns state with the turn changed when the dice roll
        action has no possible token actions`, () => {
      const action = createAction({ type: 'dice roll', rolled: List.of(1, 2), playerId: 0});
      const state = updateState(createState(2), action);
      expect(state.get('playerTurn')).toEqual(1);
      expect(state.get('nextActionType')).toEqual('dice roll');

      const action2 = createAction({ type: 'dice roll', rolled: List.of(1, 2), playerId: 1});
      const state2 = updateState(state, action2);
      expect(state2.get('playerTurn')).toEqual(0);
      expect(state2.get('nextActionType')).toEqual('dice roll');
    });

    it('returns the state with the turn not changed when there possible actions', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [7, 14] }]
      }));

      const action = createAction({ type: 'dice roll', rolled: List.of(5), playerId: 0});
      const updated = updateState(state, action);

      expect(updated.get('playerTurn')).toEqual(0);
      expect(updated.get('nextActionType')).toEqual('token action');
    });

    it('returns the state updated with a token born action', () => {
      const state = createState(2).mergeDeep(fromJS({
        nextActionType: 'token action',
        actions: [{ type: 'dice roll', rolled: [6], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('born', 'move'),
        moveToCoord: List.of(7, 14),
        tokenId: 0,
        dice: 0
      });

      const updated = updateState(state, action);
      expect(updated.getIn(['tokens', 0, 'active'])).toBe(true);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(7, 14))).toBe(true);
      expect(updated.get('playerTurn')).toBe(0);
      expect(updated.get('nextActionType')).toBe('dice roll');
    });

    it('returns the state updated with a token move action', () => {
      const state = createState(2).mergeDeep(fromJS({
        nextActionType: 'token action',
        tokens: [{ active: true, coord: [7, 14] }],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('move'),
        moveToCoord: List.of(6, 9),
        tokenId: 0,
        dice: 0
      });

      const updated = updateState(state, action);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(6, 9))).toBe(true);
      expect(updated.get('nextActionType')).toBe('dice roll');
      expect(updated.get('playerTurn')).toBe(1);
    });

    it('returns the state updated with a token kill move action', () => {
      const state = createState(2).mergeDeep(fromJS({
        nextActionType: 'token action',
        tokens: [
          { active: true, coord: [7, 14] }, {}, {}, {},
          { active: true, coord: [6, 9] }
        ],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('kill', 'move'),
        moveToCoord: List.of(6, 9),
        tokenId: 0,
        killedTokenId: 4,
        dice: 0
      });

      const updated = updateState(state, action);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(6, 9))).toBe(true);
      expect(updated.getIn(['tokens', 4, 'coord']).equals(List.of(0, 0))).toBe(true);
      expect(updated.getIn(['tokens', 4, 'active'])).toBe(false);
      expect(updated.get('playerTurn')).toBe(1);
      expect(updated.get('nextActionType')).toBe('dice roll');
    });

    it('returns the state updated with ascend action', () => {
      const state = createState(2).mergeDeep(fromJS({
        nextActionType: 'token action',
        tokens: [
          { active: true, coord: [8, 15] },
        ],
        actions: [{ type: 'dice roll', rolled: [6], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('ascend', 'move'),
        moveToCoord: List.of(8, 9),
        tokenId: 0,
        dice: 0
      });

      const updated = updateState(state, action);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(8, 9))).toBe(true);
      expect(updated.getIn(['tokens', 0, 'active'])).toEqual(false);
      expect(updated.getIn(['tokens', 0, 'ascend'])).toEqual(true);
      expect(updated.get('playerTurn')).toBe(0);
      expect(updated.get('nextActionType')).toBe('dice roll');
    });

    it('returns the state updated with the game won', () => {
      const state = createState(2).mergeDeep(fromJS({
        nextActionType: 'token action',
        tokens: [
          { active: false, ascend: true, coord: [8, 9] },
          { active: false, ascend: true, coord: [8, 9] },
          { active: false, ascend: true, coord: [8, 9] },
          { active: true, ascend: false, coord: [8, 10] },
        ],
        actions: [{ type: 'dice roll', rolled: [1], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('ascend', 'move'),
        moveToCoord: List.of(8, 9),
        tokenId: 3,
        dice: 0
      });

      const updated = updateState(state, action);
      expect(updated.getIn(['tokens', 3, 'coord']).equals(List.of(8, 9))).toBe(true);
      expect(updated.getIn(['tokens', 3, 'active'])).toEqual(false);
      expect(updated.getIn(['tokens', 3, 'ascend'])).toEqual(true);
      expect(updated.get('winner')).toBe(0);
    });

    it('gives another dice roll if rolled is 6 and there are no more possible actions', () => {
      const state = createState(2).mergeDeep(fromJS({
        playerTurn: 1,
        tokens: [
          { active: true, coord: [8, 15] }, { active: true, coord: [8, 15] }, {}, {},
          { active: true, coord: [9, 14] }, { ascend: true, coord: [9, 8] }, { ascend: true, coord: [9, 8] },
          { ascend: true, coord: [9, 8] }
        ],
      }));

      const action = createAction({ type: 'dice roll', rolled: List([2, 6]), playerId: 1 });

      const updated = updateState(state, action);
      expect(updated.get('playerTurn')).toBe(1);
      expect(updated.get('nextActionType')).toBe('dice roll');
    });
  });

  describe('diceRollAction', () => {
    it('returns a function that generates a dice roll action', () => {
      const roll = diceRollAction(2);
      expect(is(roll([1, 6]), createAction({ type: 'dice roll', rolled: List([1, 6]), playerId: 2 }))).toBe(true);
      expect(is(roll([2]), createAction({ type: 'dice roll', rolled: List([2]), playerId: 2 }))).toBe(true);
    });
  });
});
