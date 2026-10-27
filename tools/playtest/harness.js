// Playtest harness for agent players (dev server only, not part of the game build).
// In the browser pane: navigate to http://localhost:5173/ , then run
//   await import('/tools/playtest/harness.js'); await pt.start('name', { fresh: true })   (a new player)
//   (after any page reload: import again and call pt.start('name') to carry on with your save)
// The game clock is frozen between calls and only moves when you act or wait, like a real
// player's time passing. Every tap/drag also costs a little time (your finger moving).
// Screenshots go to a tiny receiver on port 8765 (scratch recv.py) as <name>_<n>_<label>.png.
//
//   pt.look(label)            screenshot -> returns the file name to open
//   pt.state()                what's on screen, in words (scene, time, money, bubbles, cups, coach...)
//   pt.where()                where things are (logical 360x640 coords): tools, cups, customers, buttons
//   pt.tap(x, y)              tap at logical coords
//   pt.drag(x1, y1, x2, y2, { holdMs })  press, move, hold (pouring), let go
//   pt.wait(seconds)          let time pass

const W = 360;
const H = 640;
const FRAME = 16.7;
let g = null;
let n = 0;
let name = 'player';

const yieldMicro = async () => { for (let j = 0; j < 8; j++) await Promise.resolve(); };
async function frames(count) {
  for (let i = 0; i < count; i++) {
    window.__t += FRAME;
    g.step(window.__t, FRAME);
    if (i % 3 === 0) await yieldMicro(); // lets the game's own awaits (demos) run
  }
}

function client(x, y) {
  const r = g.canvas.getBoundingClientRect();
  return { clientX: r.left + (x / W) * r.width, clientY: r.top + (y / H) * r.height };
}
function mouse(type, x, y, buttons) {
  g.canvas.dispatchEvent(new MouseEvent(type, { ...client(x, y), bubbles: true, cancelable: true, button: 0, buttons }));
}

const active = () => g.scene.getScenes(true).map((s) => s.scene.key);
const texts = (scene) => {
  const out = [];
  const walk = (o) => {
    if (!o.visible || o.alpha === 0) return;
    if (o.type === 'Text' && o.text?.trim()) out.push(o.text.replace(/\s+/g, ' ').trim());
    (o.list ?? []).forEach(walk);
  };
  scene.children.list.forEach(walk);
  return out;
};

export const pt = {
  // Each player gets their own save (all tabs share one localStorage): the game's keys are stored
  // under pt.<name>. in this tab. fresh = a brand-new player (their save wiped), from the title screen.
  async start(who = 'player', { fresh = false } = {}) {
    name = who;
    for (let i = 0; i < 80 && !window.__game; i++) await new Promise((r) => setTimeout(r, 100));
    g = window.__game;
    const ns = `pt.${who}.`;
    const proto = Storage.prototype;
    proto.__orig ??= { get: proto.getItem, set: proto.setItem, remove: proto.removeItem };
    const o = proto.__orig;
    const key = (st, k) => (st === window.localStorage && k.startsWith('kopiStall.') ? ns + k : k);
    proto.getItem = function (k) { return o.get.call(this, key(this, k)); };
    proto.setItem = function (k, v) { return o.set.call(this, key(this, k), v); };
    proto.removeItem = function (k) { return o.remove.call(this, key(this, k)); };
    if (fresh) Object.keys(localStorage).filter((k) => k.startsWith(ns)).forEach((k) => o.remove.call(localStorage, k));
    let t = performance.now();
    for (let i = 0; i < 60 && !g.scene.getScene('Title')?.scene.isActive(); i++) {
      await new Promise((r) => setTimeout(r, 100));
      t += FRAME;
      g.step(t, FRAME);
    }
    g.loop.sleep();
    window.__t = t;
    const base = Date.now() - t;
    Date.now = () => Math.round(base + window.__t); // tweens run on Date.now: tie it to our clock
    // back to the title screen, now reading this player's save
    g.scene.getScenes(true).forEach((sc) => sc.scene.key !== 'Title' && sc.scene.stop());
    g.scene.getScene('Title').scene.restart();
    await frames(30);
    return `ready: ${active().join(', ')} (save: ${ns})`;
  },

  async look(label = 'look') {
    n = Number(sessionStorage.getItem('pt.n') ?? 0) + 1; // keeps counting across reloads, so files never collide
    sessionStorage.setItem('pt.n', n);
    const file = `${name}_${String(n).padStart(3, '0')}_${label.replace(/[^\w-]/g, '')}`;
    const p = new Promise((r) => g.renderer.snapshot((img) => fetch(`http://127.0.0.1:8765/${file}`, { method: 'POST', body: img.src }).then(() => r(`${file}.png`), (e) => r(`snapshot failed: ${e}`))));
    await frames(2);
    return p;
  },

  async tap(x, y) {
    await frames(20); // reaching for it
    mouse('mousemove', x, y, 0);
    mouse('mousedown', x, y, 1);
    await frames(5);
    mouse('mouseup', x, y, 0);
    await frames(10);
    return this.state();
  },

  async drag(x1, y1, x2, y2, { holdMs = 0 } = {}) {
    await frames(20);
    mouse('mousemove', x1, y1, 0);
    mouse('mousedown', x1, y1, 1);
    await frames(3);
    const steps = 18;
    for (let i = 1; i <= steps; i++) {
      mouse('mousemove', x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps, 1);
      await frames(1);
    }
    const hold = Math.round(holdMs / FRAME);
    for (let i = 0; i < hold; i++) {
      mouse('mousemove', x2, y2 + (i % 2 ? 0.3 : -0.3), 1); // a hand is never perfectly still
      await frames(1);
    }
    mouse('mouseup', x2, y2, 0);
    await frames(12);
    return this.state();
  },

  async wait(seconds = 1) {
    await frames(Math.round((seconds * 1000) / FRAME));
    return this.state();
  },

  state() {
    const keys = active();
    const out = { scenes: keys };
    const top = keys.filter((k) => k !== 'Boot').map((k) => g.scene.getScene(k));
    const s = window.__stall;
    if (keys.includes('Day') && s) {
      const e = s.econ ?? {};
      out.day = s.day;
      out.clock = s.hudDay?.text ?? null;
      out.money = s.hudMoney?.text;
      out.fame = s.hudFame?.text;
      out.coach = s.coachText?.text;
      out.customers = s.allCustomers().concat(s.queue).map((c) => ({ who: c.def.short ?? c.def.name, order: c.orderText, cups: c.n > 1 ? `${c.served}/${c.n}` : undefined, state: c.state, patience: c.patienceMax ? Math.round((100 * c.patienceMs) / c.patienceMax) + '%' : undefined }));
      out.cups = s.slots.map((sl, i) => (sl.cup ? `cup ${i + 1}: ${sl.label.text}${sl.ticket ? ` (for ${sl.ticket.who})` : ''}` : `plate ${i + 1}: empty`));
      out.feedback = s.feedback?.alpha > 0 ? s.feedback.text : undefined;
      out.paused = s.paused || undefined;
      out.dialOpen = s.dial ? true : undefined;
      out.served = e.served;
    }
    out.onScreenText = top.flatMap((sc) => (sc.scene.key === 'Day' ? [] : texts(sc))).slice(0, 40);
    if (keys.includes('Day') && s?.paused) {
      // the card / book on top: texts drawn above the stall
      const walk = (o, acc) => (o.visible && o.depth >= 80 && o.type === 'Text' && o.text?.trim() && acc.push(o.text.replace(/\s+/g, ' ').trim()), (o.list ?? []).forEach((c) => walk(c, acc)), acc);
      out.cardText = s.children.list.reduce((acc, o) => walk(o, acc), []);
    }
    return out;
  },

  // Where things are, in logical coords (the screen is 360 x 640).
  where() {
    const s = window.__stall;
    if (!s || !g.scene.isActive('Day')) {
      const sc = g.scene.getScenes(true).at(-1);
      const btns = [];
      const walk = (o, ox = 0, oy = 0) => {
        if (o.input?.enabled && o.visible) {
          const b = o.getBounds?.();
          // a button's label is a separate text object sitting on it
          const label = o.text ?? o.list?.find((c) => c.text)?.text ?? sc.children.list.find((t) => t.type === 'Text' && t.visible && b?.contains(t.getBounds().centerX, t.getBounds().centerY))?.text ?? '';
          if (b) btns.push({ type: o.type, text: label, x: Math.round(b.centerX), y: Math.round(b.centerY), w: Math.round(b.width), h: Math.round(b.height) });
        }
        (o.list ?? []).forEach((c) => walk(c));
      };
      sc.children.list.forEach((o) => walk(o));
      return { scene: sc.scene.key, tappable: btns };
    }
    const tools = Object.entries(s.tools).map(([id, c]) => ({ id, label: c.tool.label, x: Math.round(c.x), y: Math.round(c.y) }));
    const cups = s.slots.map((sl, i) => ({ plate: i + 1, x: sl.x, y: 350, cup: sl.cup ? sl.label.text : 'empty' }));
    const customers = s.allCustomers().map((c) => ({ who: c.def.short ?? c.def.name, x: Math.round(s.centerX(c)), y: 250, order: c.orderText }));
    const buttons = [];
    const walk = (o) => {
      if (o.input?.enabled && o.visible && o.depth >= 40) {
        const b = o.getBounds?.();
        const text = o.text ?? s.children.list.find((t) => t.type === 'Text' && t.visible && t.depth > o.depth && b?.contains(t.getBounds().centerX, t.getBounds().centerY))?.text ?? '';
        if (b && b.width < 360) buttons.push({ text, x: Math.round(b.centerX), y: Math.round(b.centerY), w: Math.round(b.width), h: Math.round(b.height), depth: o.depth });
      }
      (o.list ?? []).forEach(walk);
    };
    s.children.list.forEach(walk);
    return { tools, cups, customers, buttons, note: 'Drag a tool onto a cup at about y 330. Serve: drag a cup (y 350) up onto the customer (y 250).' };
  },
};

window.pt = pt;
