import { List, is } from 'immutable';
import { isUndefined } from 'lodash';

export function nextCoordsFrom({
  path,
  alternate,
  switchCoord,
  fromCoord,
  next
}, list = List()) {
  if(next === 0) {
    return list;
  }

  let p = path;
  let nextCoord;

  // switch the path to the alternate path if the fromCoord is equal to
  // the switchCoord or is in the alternate path already
  if(switchCoord.equals(fromCoord) || alternate.includes(fromCoord)) {
    p = alternate;
  }

  // Only allow the nextCoord to be set if we are not at the end of the
  // alternate path and fromCoord is not undefined
  // otherwise nextCoord will be undefined
  if(!is(fromCoord, alternate.last()) && !isUndefined(fromCoord)) {
    // if fromCoord is at the end of the path or not on the path
    // reset to the beginning
    if (is(fromCoord, p.last()) || !p.includes(fromCoord)) {
      nextCoord = p.get(0);
    }
    // else progress on to the next coord on the path.
    else {
      nextCoord = p.get(p.indexOf(fromCoord) + 1);
    }
  }

  return nextCoordsFrom({
    path: p,
    alternate,
    switchCoord,
    fromCoord: nextCoord,
    next: next - 1
  }, list.push(nextCoord));
}
