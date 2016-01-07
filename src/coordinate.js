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

  // if there are more next(s) than alternate coords set nextCoord to undefined
  // because we have reached the end of the path
  // or
  // fromCoord will be undefined if at the end of the alternate path
  // so just continue to be undefined
  if(alternate.includes(fromCoord) && is(fromCoord, alternate.last()) || isUndefined(fromCoord)) {
    // Do not set nextCoord
  }
  // if fromCoord is at the end of the path or not on the path
  // reset to to the beginning
  else if (is(fromCoord, p.last()) || !p.includes(fromCoord)) {
    nextCoord = p.get(0);
  }
  // else progress on to the next coord on the path.
  else {
    nextCoord = p.get(p.indexOf(fromCoord) + 1);
  }

  return nextCoordsFrom({
    path: p,
    alternate,
    switchCoord,
    fromCoord: nextCoord,
    next: next - 1
  }, list.push(nextCoord));
}
