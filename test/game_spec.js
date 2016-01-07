import expect from 'expect';
import { processInput, update, render } from '../src/game';
import { createState } from '../src/state';
import { isFunction } from 'lodash';

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

  });
});
