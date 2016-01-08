/* global define, it, describe */
import expect from 'expect';
import { fromJS, List } from 'immutable';
import { nextCoordsFrom } from '../src/coordinate';

describe('coordinate module', () => {
  describe('nextCoordsFrom', () => {
    const path = fromJS([
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
    ]);
    const switchCoord = List.of(1, 2);
    const alternate = fromJS([
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4]
    ]);

    it('returns a List of upcoming coords from the current coord', () => {
      const subList = nextCoordsFrom({path, alternate, switchCoord, fromCoord: List.of(1, 3), next: 2});
      expect(subList.toJS()).toEqual([[1, 4], [1, 5]]);
    });

    it('returns a List of upcoming coords and loops around when the list finishes', () => {
      const subList = nextCoordsFrom({path, alternate, switchCoord, fromCoord: List.of(1, 5), next: 3});
      expect(subList.toJS()).toEqual([[1, 6], [1, 1], [1, 2]]);
    });

    it('switches over to the alternate path it hits the switchCoord', () => {
      const subList = nextCoordsFrom({path, alternate, switchCoord, fromCoord: List.of(1, 1), next: 3});
      expect(subList.toJS()).toEqual([[1, 2], [2, 1], [2, 2]]);
    });

    it('switches over to alternate path when on the switchCoord', () => {
      const subList = nextCoordsFrom({path, alternate, switchCoord, fromCoord: List.of(1, 2), next: 3});
      expect(subList.toJS()).toEqual([[2, 1], [2, 2], [2, 3]]);
    });

    it('stays on alternate path if already on it', () => {
      const subList = nextCoordsFrom({path, alternate, switchCoord, fromCoord: List.of(2, 1), next: 2});
      expect(subList.toJS()).toEqual([[2, 2], [2, 3]]);
    });

    it('returns a list with undefined if the next more than alternate coords', () => {
      const subList = nextCoordsFrom({path, alternate, switchCoord, fromCoord: List.of(2, 3), next: 3});
      expect(subList.toJS()).toEqual([[2, 4], undefined, undefined]); // eslint-disable-line no-undefined
    });
  });
});
