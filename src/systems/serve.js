// Who a dropped cup goes to. Pure, so the rules can be tested without the scene.
//   zones:  [{ c, rect: { x, y, w, h }, cx, cy }]  one per waiting customer (a group = one zone)
//   ticket: the customer the cup was made for ("for X"), or null
//   point:  where the cup was let go; inArea: the point is up in the customer area (above the tray)
// Order: the cup's own customer if the point is on them (Ah Gong behind the front row) -> anyone
// else under the point, nearest first -> the cup's own customer anywhere in the customer area -> nobody.
const inside = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export function pickServeTarget({ zones, ticket = null, point, inArea = false }) {
  const { x, y } = point;
  const hit = zones.filter((z) => inside(z.rect, x, y));
  if (ticket && hit.some((z) => z.c === ticket)) return ticket;
  if (hit.length) {
    const d = (z) => Math.hypot(x - z.cx, (y - z.cy) * 0.5); // sideways counts more than up/down
    return hit.reduce((best, z) => (d(z) < d(best) ? z : best)).c;
  }
  if (ticket && inArea && zones.some((z) => z.c === ticket)) return ticket;
  return null;
}
