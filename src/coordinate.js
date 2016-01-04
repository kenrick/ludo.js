import { Range, List, is } from 'immutable'

export function nextCoordsFrom({
  path,
  heaven,
  switchCoord,
  fromCoord,
  next
}, list = List()) {
  if(next === 0) {
    return list;
  }

  let p = path;
  let nextCoord;

  if(switchCoord.equals(fromCoord) || heaven.includes(fromCoord)) {
    p = heaven;
  }

  if(heaven.includes(fromCoord) && is(fromCoord, heaven.last())) {
    nextCoord = undefined;
  } else if(is(fromCoord, p.last()) || !p.includes(fromCoord)) {
    nextCoord = p.get(0);
  } else {
    nextCoord = p.get(p.indexOf(fromCoord) + 1);
  }

  if(fromCoord === undefined) {
    nextCoord = undefined;
  }

  return nextCoordsFrom({
    path: p,
    heaven,
    switchCoord,
    fromCoord: nextCoord,
    next: next-1
  }, list.push(nextCoord));
}
