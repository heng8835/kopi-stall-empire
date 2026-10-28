// Who a dropped cup goes to. Pure, so the rules can be tested without the scene.
//   zones:  [{ c, rect, body, cx, cy }]  one per waiting customer (a group = one zone);
//           rect = the people + their bubble, body = just the people (defaults to rect)
//   ticket: the customer the cup was made for ("for X"), or null
//   point:  where the cup was let go; inArea: the point is up in the customer area (above the tray)
//   fit:    (c) => how well the cup suits c's order (higher = better); omitted = all the same
// The rule players see: a cup labelled "for X" goes to X. The one exception is a drop right on
// someone else's body when the cup suits them just as well (two people who both want Kopi O), or on
// their bubble when it suits them better than its label's customer (a spare drink that is theirs).
const inside = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export function pickServeTarget({ zones, ticket = null, point, inArea = false, fit = () => 0 }) {
  const { x, y } = point;
  const hit = zones.filter((z) => inside(z.rect, x, y));
  const d = (z) => Math.hypot(x - z.cx, (y - z.cy) * 0.5); // sideways counts more than up/down
  const nearest = (list) => list.reduce((best, z) => (d(z) < d(best) ? z : best)).c;
  const waiting = ticket && zones.some((z) => z.c === ticket);
  if (waiting && hit.some((z) => z.c === ticket)) return ticket;
  if (waiting && (inArea || hit.length)) {
    const mine = fit(ticket);
    // on their body: as good a fit is enough; on their bubble only a strictly better one (a spare drink
    // that is exactly theirs), so Ah Gong's own cup still gets past the front row's bubbles
    const others = hit.filter((z) => z.c !== ticket && (inside(z.body ?? z.rect, x, y) ? fit(z.c) >= mine : fit(z.c) > mine));
    return others.length ? nearest(others) : ticket;
  }
  return hit.length ? nearest(hit) : null;
}
