/* global define, it, describe */
import expect, { createSpy } from 'expect';
import { processInput, update, render } from '../src/game';
import { createState, createAction } from '../src/state';
import { isFunction } from 'lodash';
import { List, fromJS } from 'immutable';

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

    it('predicts the born action when a six is rolled', () => {
      const spy = createSpy();
      const state = createState(2).mergeDeep(fromJS({
        actions: [{ type: 'dice roll', rolled: [6], playerId: 0}]
      }));
      processInput(state, spy);

      const {type, finder} = spyArgs(spy)[0];
      expect(type).toBe('token action');
      expect(finder(0).first().get('verbs').toJS()).toEqual(['born', 'move']);
      expect(finder(0).first().get('moveToCoord').equals(List.of(7, 14))).toBe(true);
      expect(finder(0).first().get('tokenId')).toBe(0);
      expect(finder(0).first().get('dice').first()).toBe(0);
      expect(finder(0).first().get('dice').last()).toBe(true);
      expect(finder(0).count()).toBe(4);
    });

    it('predicts the token move action when there active tokens', () => {
      const spy = createSpy();
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [7, 14] }],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}]
      }));
      processInput(state, spy);

      const {type, finder} = spyArgs(spy)[0];
      expect(type).toBe('token action');
      expect(finder(0).count()).toBe(1);
      expect(finder(0).first().get('verbs').toJS()).toEqual(['move']);
      expect(finder(0).first().get('moveToCoord').equals(List.of(6, 9))).toBe(true);
      expect(finder(0).first().get('tokenId')).toBe(0);
    });

    it('predicts the token kill move action when there is an enemy token at the moveToCoord', () => {
      const spy = createSpy();
      const state = createState(2).mergeDeep(fromJS({
        tokens: [
          { active: true, coord: [7, 14] }, {}, {}, {},
          { active: true, coord: [6, 9] }
        ],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}]
      }));
      processInput(state, spy);

      const {type, finder} = spyArgs(spy)[0];
      expect(type).toBe('token action');
      expect(finder(0).count()).toBe(1);
      expect(finder(0).first().get('verbs').toJS()).toEqual(['kill', 'move']);
      expect(finder(0).first().get('moveToCoord').equals(List.of(6, 9))).toBe(true);
      expect(finder(0).first().get('tokenId')).toBe(0);
      expect(finder(0).first().get('killedTokenId')).toBe(4);
    });

    it('predicts the token move action when there active tokens', () => {
      const spy = createSpy();
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [7, 14] }],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}]
      }));
      processInput(state, spy);

      const {type, finder} = spyArgs(spy)[0];
      expect(type).toBe('token action');
      expect(finder(0).count()).toBe(1);
      expect(finder(0).first().get('verbs').toJS()).toEqual(['move']);
      expect(finder(0).first().get('moveToCoord').equals(List.of(6, 9))).toBe(true);
      expect(finder(0).first().get('tokenId')).toBe(0);
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

    it('returns the state updated with a token born action', () => {
      const state = createState(2).mergeDeep(fromJS({
        actions: [{ type: 'dice roll', rolled: [6], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('born', 'move'),
        moveToCoord: List.of(7, 14),
        tokenId: 0,
        dice: List.of(0, true)
      });

      const updated = update(state, action);
      expect(updated.getIn(['tokens', 0, 'active'])).toBe(true);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(7, 14))).toBe(true);
      expect(updated.get('playerTurn')).toBe(0);
    });

    it('returns the state updated with a token move action', () => {
      const state = createState(2).mergeDeep(fromJS({
        tokens: [{ active: true, coord: [7, 14] }],
        actions: [{ type: 'dice roll', rolled: [5], playerId: 0}]
      }));

      const action = createAction({
        type: 'token action',
        verbs: List.of('move'),
        moveToCoord: List.of(6, 9),
        tokenId: 0,
        dice: List.of(0, true)
      });

      const updated = update(state, action);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(6, 9))).toBe(true);
      expect(updated.get('playerTurn')).toBe(1);
    });

    it('returns the state updated with a token kill move action', () => {
      const state = createState(2).mergeDeep(fromJS({
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
        dice: List.of(0, true)
      });

      const updated = update(state, action);
      expect(updated.getIn(['tokens', 0, 'coord']).equals(List.of(6, 9))).toBe(true);
      expect(updated.getIn(['tokens', 4, 'coord']).equals(List.of(0, 0))).toBe(true);
      expect(updated.getIn(['tokens', 4, 'active'])).toBe(false);
      expect(updated.get('playerTurn')).toBe(1);
    });
  });
});
