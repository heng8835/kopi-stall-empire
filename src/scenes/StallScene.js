import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CUSTOMERS, WALK_INS } from '../data/customers.js';
import { OWNERS } from '../data/owners.js';
import { TOOLS, SLOT_X, SPOT_X, MACHINE_TOOLS } from '../data/tools.js';
import { TUNING } from '../data/stallTuning.js';
import { pickLine, UI } from '../i18n/lines.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite, displayHeight } from '../systems/sprites.js';
import { makeButton, layoutLine, showGlossary, addMuteToggle } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { parseOrder } from '../systems/order.js';
import { newCup, pour, addIce, addPowder, stirStep, gradeCup, formatCup } from '../systems/cup.js';
import { DRINKS } from '../data/drinks.js';
import { DrinkArt, ART_ORIGIN } from '../systems/drinkArt.js';
import { PourBar } from '../systems/pourBar.js';
import { showRecipeCard, showRecipeBook } from '../systems/cards.js';
import { ordersFor, lessonFor, unlockedFeatures, regularOrder } from '../systems/menu.js';
import { perks, gift } from '../systems/shop.js';
import { SHOP_FROM_DAY, GIFTS } from '../data/shop.js';
import { STALL_PROPS, PROP_DEPTH } from '../data/stallProps.js';
import { MACHINE_LESSONS, BOOK } from '../data/recipes.js';
import { MALT } from '../systems/order.js';
import { summarizeDay } from '../systems/daySummary.js';
import { recipeHint, nextStep } from '../systems/hints.js';
import { pickFor, fitScore } from '../systems/assign.js';
import { createDayState, applyServe, applyTimeout, formatMoney, customersForFame, clampFame } from '../systems/economy.js';
import { weightedPick } from '../systems/random.js';
import { placeArrival, frontCanTake, daySchedule } from '../systems/queue.js';
import { newRun, nextDay, loadRun, saveRun, auntyRating, monthOver, MONTH_DAYS } from '../systems/run.js';
import { eventsFor, applyChoice } from '../systems/story.js';
import { EVENTS } from '../data/events.js';
import { startDay, logEvent, finishDay, summarize } from '../systems/playlog.js';
import { Tutorial } from '../systems/tutorial.js';
import { TUTORIAL_STEPS, TOOL_IDS } from '../data/tutorial.js';
import { load } from '../systems/save.js';

// The kopi stall, seen from behind the counter: customers across the counter at the top,
// a tray of 3 cup spots in the middle, and the tools along the bottom. Drinks are made by
// dragging: hold a pot/can/sugar over a cup to pour, drop ice/powder, wiggle the spoon to
// stir, then drag the cup to the customer who ordered it.

const OPEN_MIN = 7 * 60; // 7:00am
const CLOSE_MIN = 19 * 60; // 7:00pm

// Layout (logical px, 360x640), matched to the stall background art (901x1600 = 2.5x).
const HUD_H = 40; // clock + day bar + fame + money
const POUR_BAR_Y = HUD_H + 6; // the pour bar docks here, above the order bubbles
const COUNTER_Y = 282; // top of the wooden counter in the background
const FEET_Y = 318; // counter customers stand behind the counter (legs hidden)
const CUP_BOTTOM = 384; // cups sit on the tray plates
const CUP_W = 50;
const CUP_H = 62;
const TABLE = { x: 46, feetY: 116, h: 80, bubble: { x: 96, y: 46, w: 176 } }; // Ah Gong by the window, above the order bubbles
const GROUP_X = [40, 130, 220, 310];
const BUBBLE_BOTTOM = 172;
const LIFT = 36; // dragged things float above the finger so you can see them
const TABLE_LINGER_MS = 3500;
const BG_SCALE = 901 / GAME_W; // background art pixels per logical px
// Customers walk in from the street opening on the left (small = far away) and, when the
// counter is full, wait in a line behind it, front first.
const ENTRY = { x: -40, feetY: 236 };
const QUEUE_POS = [{ x: 126, feetY: 270 }, { x: 88, feetY: 262 }, { x: 50, feetY: 254 }];
const MID_STORY_AT = 0.4; // a 'mid' episode plays this far into the day
const COACH_Y = 410; // the owner's thought bubble, between the tray and the tools
const LESSON_AT_MS = 5000; // a recipe teacher walks in this far into a lesson day
// Day periods on the HUD bar, in minutes from opening (7am): morning, lunch rush, teatime, closing.
// Code-drawn stand-ins for lifted tools whose own art hasn't arrived yet (StallScene methods).
const DRAWN_LIFT = { toolSpoon: function () { return this.drawnSpoon(); }, toolIceScoop: function () { return this.drawnIceScoop(); } };
const PERIOD_ICONS = ['iconMorning', 'iconLunch', 'iconTeatime', 'iconClosing'];
const PERIODS = [['Morning', 0, 240, 0xffe9a8], ['Lunch', 240, 420, 0xffb870], ['Teatime', 420, 600, 0xbfe0c4], ['Closing', 600, 720, 0x9fb3d9]];
const DRAG_WAIT_MS = 3000; // ...once the player lets go of a cup/tool (or after this long at most)

export default class StallScene extends Phaser.Scene {
  constructor() {
    super('Day');
  }

  create(data) {
    fitCamera(this);
    this.run = data?.run ?? loadRun() ?? newRun();
    this.day = this.run.day;
    this.flags = [...this.run.flags];
    this.owner = OWNERS[this.registry.get('owner') ?? load('owner', 'mei')] ?? OWNERS.mei;
    this.econ = createDayState({ money: this.run.money, fame: this.run.fame });
    // everything bought in the night shop (src/data/shop.js), added up
    this.perks = perks(this.run.owned);
    this.queueMax = TUNING.queueMax + this.perks.queueBonus;
    if (this.perks.famePerDay) this.econ.fame = Math.min(100, this.econ.fame + this.perks.famePerDay);
    this.clockMs = 0;
    this.spots = [null, null, null]; // counter customers by spot
    this.queue = []; // customers waiting behind the counter, front first
    this.tableGuest = null;
    this.storyDone = new Set(); // 'start' / 'mid' / 'end' already played today
    this.midWaitMs = 0;
    this.dragging = 0;
    this.ending = null;
    // today's new recipes: the calendar's, then any machine bought last night (src/data/recipes.js)
    const machineLessons = (this.run.newItems ?? []).map((id) => MACHINE_LESSONS[id] && { ...MACHINE_LESSONS[id], day: this.day }).filter(Boolean);
    this.lessons = [lessonFor(this.day), ...machineLessons].filter(Boolean);
    this.freshFeatures = machineLessons.flatMap((l) => l.features);
    // Today's arrivals: every regular with something to drink comes once at their usual time, and
    // random walk-ins fill up the rest. More fame, more customers (a group counts as one arrival).
    const regulars = CUSTOMERS.filter((c) => c.regular && c.enabled && c.sprite && (c.fromDay ?? 1) <= this.day && this.menuOf(c).length);
    this.arrivals = daySchedule({
      total: customersForFame(this.econ.fame) + this.perks.extraCustomers,
      regulars,
      dayMs: TUNING.dayMs,
      start: TUNING.firstSpawnMs,
      end: TUNING.dayMs - TUNING.lastSpawnBeforeEndMs,
      jitter: TUNING.spawnJitter,
    });
    this.cameToday = new Set(); // regulars (and guests) who have already been in today
    this.nextLesson();
    this.paused = false;
    this.ended = false;
    // Phaser reuses this scene object every day: reset everything the last day may have left set
    // (a leftover `closing` turned every Day 2 customer away)
    this.closing = false;
    this.overtimeMs = 0;
    this.focusSlot = null;
    this.towelUsed = false;
    this.leaving = false;
    this.rating = undefined;
    this.guestEpisode = null;
    this.pouring = null; // { tool, slot }
    this.lastPourSound = 0;
    this.log = startDay({ day: this.day, owner: this.owner.name });
    this.input.dragDistanceThreshold = 6; // taps don't start drags

    this.drawBackdrop();
    this.drawHud();
    this.drawTray();
    this.drawCoach();
    this.drawTools();
    this.drawStallProps();
    if (this.perks.menuBoard) this.drawMenuBoard();
    if (this.perks.famePerDay) this.time.delayedCall(800, () => this.setFeedback(`Your decor & comforts: 名气 +${this.perks.famePerDay} today`));
    this.feedback = addText(this, GAME_W / 2, COUNTER_Y + 10, '', { size: 12, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc', wrap: 340 }).setDepth(40);
    this.feedback.setStroke('#3a2414', 3);

    this.tutorial = new Tutorial(this, TUTORIAL_STEPS);
    if (data?.morning) this.openShutter();
    if (this.day === 1 && !load('tutorialDone', false)) this.tutorial.start();
    else this.time.delayedCall(data?.morning ? 1900 : 500, () => this.playStory('start'));

    if (import.meta.env.DEV) window.__stall = this;
  }

  // ---------- drawing ----------

  drawBackdrop() {
    this.add.image(0, 0, 'stallBg').setOrigin(0).setDisplaySize(GAME_W, GAME_H).setDepth(0);
    // The counter + our side of the stall again, as a front layer: customers stand behind it.
    const top = Math.round(COUNTER_Y * BG_SCALE);
    this.add.image(0, 0, 'stallBg').setOrigin(0).setDisplaySize(GAME_W, GAME_H).setCrop(0, top, 901, 1600 - top).setDepth(10);
  }

  drawHud() {
    this.add.rectangle(0, 0, GAME_W, HUD_H, 0x2e5e63).setOrigin(0).setDepth(50);
    const opts = { size: 13, bold: true, color: '#ffffff' };
    // the kopitiam wall clock: the hour hand sweeps 7am -> 7pm, the minute hand spins
    const cx = 20;
    const cy = HUD_H / 2;
    addSprite(this, 'hudClockFace', cx, cy + displayHeight('hudClockFace') / 2).setDepth(51);
    // hands pivot on the round boss near their base
    this.hourHand = addSprite(this, 'hudHourHand', cx, cy).setOrigin(0.5, 0.86).setDepth(52);
    this.minuteHand = addSprite(this, 'hudMinuteHand', cx, cy).setOrigin(0.5, 0.9).setDepth(53);
    this.hudDay = addText(this, 42, 3, '', { ...opts, size: 12 }).setDepth(51);
    // the day as a bar with labelled periods and a moving marker
    this.dayBar = { x: 42, y: 20, w: 172, h: 14 };
    const bar = this.add.graphics().setDepth(51);
    for (const [name, a, b, color] of PERIODS) {
      const x0 = this.dayBar.x + (a / 720) * this.dayBar.w;
      const x1 = this.dayBar.x + (b / 720) * this.dayBar.w;
      bar.fillStyle(color, 1).fillRect(x0, this.dayBar.y, x1 - x0, this.dayBar.h);
      addText(this, (x0 + x1) / 2, this.dayBar.y + this.dayBar.h / 2, name, { size: 8, bold: true, color: '#2b2420', origin: 0.5 }).setDepth(52);
    }
    bar.lineStyle(1.5, 0x1c3a3d, 1).strokeRect(this.dayBar.x, this.dayBar.y, this.dayBar.w, this.dayBar.h);
    this.dayMarker = this.add.graphics().setDepth(53);
    // the icon of the period we're in, beside the time
    this.periodIcon = addSprite(this, 'iconMorning', 0, 15).setDepth(51);
    addSprite(this, 'iconFame', 229, 29).setDepth(51);
    this.hudFame = addText(this, 239, 12, '', opts).setDepth(51);
    this.hudMoney = addText(this, GAME_W - 8, 12, '', { ...opts, origin: [1, 0] }).setDepth(51);
    this.hudCoin = addSprite(this, 'iconCoin', 0, 28).setDepth(51);
    // under the HUD, top right: recipe book + sound
    const book = addSprite(this, 'iconBook', GAME_W - 22, HUD_H + 27).setDepth(45).setInteractive({ useHandCursor: true });
    book.on('pointerdown', () => this.openRecipeBook());
    addMuteToggle(this, GAME_W - 62, HUD_H + 9, { size: 11 }).setDepth(45);
    this.pourBar = new PourBar(this, POUR_BAR_Y);
    this.refreshHud();
  }

  drawTray() {
    this.slots = SLOT_X.map((x, i) => {
      const label = addText(this, x, CUP_BOTTOM + 6, '', { size: 10, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc', wrap: 112 }).setDepth(16);
      label.setStroke('#3a2414', 3);
      const container = this.add.container(x, CUP_BOTTOM).setDepth(14);
      // the cup, its drink, stream, steam and ice: drawn on a canvas at the glass art's resolution
      const art = new DrinkArt(this, `cupArt${i}`);
      const img = this.add.image(0, 0, `cupArt${i}`).setOrigin(ART_ORIGIN.x, ART_ORIGIN.y).setScale(CUP_H / 186);
      container.add(img);
      // Hit box covers the whole cup + saucer: world y from CUP_BOTTOM - CUP_H - 8 to CUP_BOTTOM + 16.
      // (A container's local hit space starts at its position minus half its size.)
      const hitH = CUP_H + 24;
      container.setSize(CUP_W + 24, hitH);
      container.setInteractive(new Phaser.Geom.Rectangle(0, hitH / 2 - CUP_H - 8, CUP_W + 24, hitH), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(container);
      // who the cup is for, just above it (moves with the cup when dragged)
      const forText = addText(this, 0, -CUP_H - 6, '', { size: 9, bold: true, color: '#fff6dc', origin: [0.5, 1] });
      forText.setStroke('#3a2414', 3);
      container.add(forText);
      const slot = { i, x, cup: null, container, art, label, forText, ticket: null }; // ticket = who it's for (assignCup)
      container.on('dragstart', () => this.onCupDragStart(slot));
      container.on('drag', (p) => this.onCupDrag(slot, p));
      container.on('dragend', (p) => this.onCupDragEnd(slot, p));
      this.redrawSlot(slot);
      return slot;
    });
  }

  drawTools() {
    this.tools = {};
    const extra = (this.run.owned ?? []).map((id) => MACHINE_TOOLS[id]).filter(Boolean);
    for (const t of [...TOOLS, ...extra]) {
      const c = this.add.container(t.x, t.y).setDepth(20);
      const parts = [];
      if (t.sprite) {
        const s = addSprite(this, t.sprite, 0, t.h / 2 - 12, t.spriteH);
        if (t.tint) s.setTint(t.tint); // a stand-in recoloured until its own art arrives
        c.sprite = s;
        parts.push(s);
      }
      else {
        const g = this.add.graphics();
        this.drawToolShape(g, t);
        parts.push(g);
      }
      // name tag so similar-looking cans are easy to tell apart
      const label = addText(this, 0, t.h / 2 - 12, t.label, { size: 9, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc' });
      const tag = this.add.rectangle(0, t.h / 2 - 12, label.width + 8, 12, 0x2b2420, 0.75).setOrigin(0.5, 0);
      parts.push(tag, label);
      c.add(parts);
      c.setSize(t.w, t.h);
      c.setInteractive(new Phaser.Geom.Rectangle(0, 0, t.w, t.h), Phaser.Geom.Rectangle.Contains);
      c.tool = t;
      c.home = { x: t.x, y: t.y };
      c.area = () => new Phaser.Geom.Rectangle(t.x - t.w / 2, t.y - t.h / 2, t.w, t.h);
      this.tools[t.id] = c;
      if (t.kind === 'bin') continue;
      this.input.setDraggable(c);
      c.on('dragstart', () => this.onToolDragStart(c));
      c.on('drag', (p) => this.onToolDrag(c, p));
      c.on('dragend', (p) => this.onToolDragEnd(c, p));
      if (t.kind === 'rack') c.on('pointerup', (p) => p.getDistance() < 6 && this.placeCupInFreeSlot());
    }
    if (import.meta.env.DEV) TOOL_IDS.filter((id) => !this.tools[id]).forEach((id) => console.warn('[tutorial] no tool for id', id));
  }

  // Shape for tools without art yet: a tin for pouring tools (Horlicks), else the bin.
  drawToolShape(g, t) {
    const w = t.w - 10;
    const h = t.h - 18;
    const top = -t.h / 2 + 2;
    if (t.kind === 'pour') {
      g.fillStyle(t.color ?? 0xd9c49a, 1).fillRoundedRect(-w / 2, top + 6, w, h - 6, 5).lineStyle(2, 0x3a2e2a, 0.9).strokeRoundedRect(-w / 2, top + 6, w, h - 6, 5);
      g.fillStyle(0xb8bfc6, 1).fillRoundedRect(-w / 2 - 2, top, w + 4, 9, 3).lineStyle(2, 0x3a2e2a, 0.9).strokeRoundedRect(-w / 2 - 2, top, w + 4, 9, 3);
      g.fillStyle(0xfff3d6, 1).fillRect(-w / 2 + 3, top + 16, w - 6, 12); // plain label band (no logo)
      g.fillStyle(0xc8402c, 1).fillRect(-w / 2 + 3, top + 30, w - 6, 3);
      return;
    }
    g.fillStyle(t.color ?? 0x6c757d, 1).fillRoundedRect(-w / 2, top + 6, w, h - 6, 6).lineStyle(2, 0x2b2b2b, 0.8).strokeRoundedRect(-w / 2, top + 6, w, h - 6, 6);
    g.fillStyle(0x4a4f55, 1).fillRoundedRect(-w / 2 - 3, top, w + 6, 8, 3);
    g.lineStyle(2, 0x3a3a3a).lineBetween(-7, top + 14, -7, top + h - 6).lineBetween(0, top + 14, 0, top + h - 6).lineBetween(7, top + 14, 7, top + h - 6);
  }

  // The drink itself is drawn every frame by slot.art (systems/drinkArt.js); this updates the label.
  redrawSlot(slot) {
    slot.label.setText(slot.cup ? formatCup(slot.cup) : '');
    slot.forText.setText(slot.cup && slot.ticket ? `for ${slot.ticket.who}` : '');
  }

  // ---------- cups on the tray ----------

  // ---------- the coach: the owner thinks out loud about the next step ----------

  drawCoach() {
    const x = 34;
    const w = GAME_W - x - 8;
    this.coachFace = addSprite(this, this.owner.sprite, 17, COACH_Y + 34, 34).setDepth(18);
    const g = this.add.graphics().setDepth(18);
    g.fillStyle(0xffffff, 0.95).fillRoundedRect(x, COACH_Y, w, 32, 12).lineStyle(2, 0x3a2e2a, 0.8).strokeRoundedRect(x, COACH_Y, w, 32, 12);
    g.fillStyle(0xffffff, 0.95).fillCircle(x - 3, COACH_Y + 24, 4).lineStyle(1.5, 0x3a2e2a, 0.8).strokeCircle(x - 3, COACH_Y + 24, 4);
    this.coachText = addText(this, x + 9, COACH_Y + 16, '', { size: 10, bold: true, color: '#3a2e2a', origin: [0, 0.5], wrap: w - 16, lineSpacing: 0 }).setDepth(19);
    this.coachParts = [this.coachFace, g, this.coachText];
    this.coachShown = '';
    this.coachIn = 0;
    this.setCoach('');
  }

  setCoach(text, warn = false) {
    if (text === this.coachShown) return;
    this.coachShown = text;
    this.coachParts.forEach((o) => o.setVisible(!!text));
    if (!text) return;
    this.coachText.setText(text).setColor(warn ? '#c8402c' : '#3a2e2a');
    // two lines fit; anything longer shrinks a little
    this.coachText.setScale(1);
    if (this.coachText.height > 30) this.coachText.setScale(30 / this.coachText.height);
    this.tweens.add({ targets: this.coachText, alpha: { from: 0.3, to: 1 }, duration: 200 });
  }

  // The owner murmurs: the next step for the cup last worked on, else what the latest
  // customer wants and how to make it.
  updateCoach(delta) {
    this.coachIn -= delta;
    if (this.coachIn > 0) return;
    this.coachIn = 200;
    const live = (sl) => sl?.cup && sl.ticket;
    const slot = live(this.focusSlot) ? this.focusSlot : this.slots.find(live);
    if (slot && (slot.cup.base || slot === this.focusSlot)) {
      const r = nextStep(slot.cup, slot.ticket.spec, slot.ticket.who);
      return this.setCoach(`Cup ${slot.i + 1} for ${slot.ticket.who}: ${r.text}`, r.bin);
    }
    const f = this.focusSlot;
    if (f?.cup?.base && !f.ticket) return this.setCoach(`Cup ${f.i + 1}: nobody waiting wants a ${formatCup(f.cup)}. Bin it, or keep it for later`, true);
    const unmade = this.waitingCustomers().filter((c) => this.cupsOwed(c) > 0);
    const latest = unmade.sort((a, b) => (b.arrivedAt ?? 0) - (a.arrivedAt ?? 0))[0];
    if (latest) {
      const grab = this.slots.some((sl) => sl.cup && !sl.cup.base) ? '' : this.freeSlot() ? 'Tap Cups, then: ' : 'Tray full! ';
      return this.setCoach(`${grab}${latest.def.short ?? latest.def.name} wants ${latest.orderText}: ${recipeHint(latest.spec)}`);
    }
    if (this.closing) return this.setCoach("Closing time. Last customers, then we 收档!");
    if (!this.allCustomers().length) return this.setCoach('Waiting for customers… 等客人');
    this.setCoach('');
  }

  freeSlot() {
    return this.slots.find((s) => !s.cup);
  }

  placeCup(slot) {
    if (!slot || slot.cup || this.ended) return false;
    slot.cup = newCup();
    this.assignCup(slot);
    play('cupDown');
    this.tweens.add({ targets: slot.container, y: { from: CUP_BOTTOM - 10, to: CUP_BOTTOM }, duration: 120 });
    return true;
  }

  placeCupInFreeSlot() {
    return this.placeCup(this.freeSlot());
  }

  removeCup(slot) {
    slot.ticket = null;
    slot.cup = null;
    this.redrawSlot(slot);
  }

  // ---------- who is each cup for? (no tickets: the game guesses from the cup) ----------

  // Cups a customer still needs that no cup on the tray is already heading to.
  cupsOwed(c, except = null) {
    const heading = this.slots.filter((sl) => sl !== except && sl.cup && sl.ticket?.c === c).length;
    return c.n - c.served - heading;
  }

  // Match a cup to the waiting customer it fits best (oldest first on a tie).
  assignCup(slot) {
    const cands = this.waitingCustomers()
      .filter((c) => this.cupsOwed(c, slot) > 0)
      .sort((a, b) => (a.arrivedAt ?? 0) - (b.arrivedAt ?? 0))
      .map((c) => ({ c, spec: c.spec }));
    const pick = slot.cup ? pickFor(slot.cup, cands) : null;
    slot.ticket = pick ? { c: pick.c, spec: pick.spec, who: pick.c.def.short ?? pick.c.def.name } : null;
    this.redrawSlot(slot);
  }

  // After the cup changes: keep its customer unless it no longer fits (or they left).
  recheckCup(slot) {
    const t = slot.ticket;
    if (!t || t.c.state === 'gone' || fitScore(slot.cup, t.spec) < 0) this.assignCup(slot);
    else this.redrawSlot(slot);
  }

  // Where this cup should be poured to: ¾ for peng (the ice tops it up), else full.
  targetFill(slot) {
    const spec = slot.ticket?.spec;
    if (!spec) return this.perks.marked && slot.cup ? [0.68, 0.94] : null; // Marked Glasses
    return spec.iced ? 0.68 : 0.94;
  }

  slotAt(x, y) {
    return this.slots.find((s) => Math.abs(x - s.x) < 52 && y > CUP_BOTTOM - CUP_H - 46 && y < CUP_BOTTOM + 18);
  }

  onCupDragStart(slot) {
    this.dragging += 1;
    if (!slot.cup) return;
    play('pickup');
    slot.container.setDepth(45);
  }

  onCupDrag(slot, p) {
    if (!slot.cup) return;
    slot.container.setPosition(p.worldX, p.worldY + 20);
    const c = this.customerAt(p.worldX, p.worldY);
    this.highlightCustomer(c);
  }

  onCupDragEnd(slot, p) {
    this.dragging = Math.max(0, this.dragging - 1);
    this.highlightCustomer(null);
    const back = () => {
      slot.container.setDepth(14);
      this.tweens.add({ targets: slot.container, x: slot.x, y: CUP_BOTTOM, duration: 160, ease: 'Quad.out' });
    };
    if (!slot.cup) return back();
    if (Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(this.tools.bin.area(), 8, 8), p.worldX, p.worldY)) {
      play('bin');
      logEvent(this.log, 'bin', { made: formatCup(slot.cup) }, this.clockMs);
      this.removeCup(slot);
      slot.container.setPosition(slot.x, CUP_BOTTOM).setDepth(14);
      return;
    }
    const c = this.customerAt(p.worldX, p.worldY);
    if (c && c.state === 'waiting') {
      this.serveCup(slot, c);
      slot.container.setPosition(slot.x, CUP_BOTTOM).setDepth(14);
      return;
    }
    back();
  }

  // ---------- tools ----------

  onToolDragStart(tool) {
    this.dragging += 1;
    play('pickup');
    this.liftTool(tool, true);
    tool.setDepth(46);
    this.tweens.add({ targets: tool, scale: 1.08, duration: 80 });
    tool.lastStirDir = 0;
    tool.lastX = null;
  }

  onToolDrag(tool, p) {
    tool.setPosition(p.worldX, p.worldY - LIFT);
    const t = tool.tool;
    // the "business end" of the tool (spout / spoon tip) is its bottom edge
    const slot = this.slotAt(p.worldX, p.worldY - LIFT + t.h / 2);
    const target = slot?.cup ? slot : null;
    if (t.kind === 'pour' && this.dosed(t)) {
      tool.setAngle(target ? -25 : 0); // scoop / pump: one dose when you let go over the cup
    } else if (t.kind === 'pour') {
      this.pouring = target ? { tool, slot: target } : null;
      this.poseTool(tool, !!target);
    } else if (t.kind === 'stir' && target?.cup.base) {
      const x = p.worldX;
      if (tool.lastX !== null && Math.abs(x - tool.lastX) > 5) {
        const dir = Math.sign(x - tool.lastX);
        if (tool.lastStirDir && dir !== tool.lastStirDir) this.stirCup(target);
        tool.lastStirDir = dir;
        tool.lastX = x;
      } else if (tool.lastX === null) tool.lastX = x;
    }
    tool.hoverSlot = target;
  }

  // Picked up: some tools leave their holder (the spoon comes out of its cup), and go back on release.
  liftTool(tool, lifted) {
    const t = tool.tool;
    if (!t.liftSprite || !tool.sprite) return;
    const key = lifted ? (this.textures.exists(t.liftSprite) ? t.liftSprite : DRAWN_LIFT[t.liftSprite].call(this)) : t.sprite;
    tool.sprite.setTexture(key);
    const h = lifted ? t.liftH : t.spriteH ?? displayHeight(key);
    tool.sprite.setScale(h / tool.sprite.height).setAngle(lifted ? t.liftAngle ?? 18 : 0);
  }

  // A long kopitiam spoon drawn in code (3x for crispness), until its own art arrives.
  drawnSpoon() {
    const key = 'toolSpoonDrawn';
    if (this.textures.exists(key)) return key;
    const g = this.make.graphics({ add: false });
    const ink = 0x3a2e2a;
    g.fillStyle(ink, 1).fillRoundedRect(15, 0, 18, 150, 9).fillEllipse(24, 160, 48, 66); // outline
    g.fillStyle(0xc9ced4, 1).fillRoundedRect(19, 4, 10, 142, 5).fillEllipse(24, 160, 38, 56); // steel
    g.fillStyle(0xf4f6f8, 1).fillRoundedRect(21, 10, 3, 120, 2).fillEllipse(17, 152, 9, 22); // shine
    g.fillStyle(0x9aa1a8, 1).fillEllipse(30, 168, 14, 26); // bowl shade
    g.generateTexture(key, 48, 194);
    g.destroy();
    return key;
  }

  // An ice scoop heaped with our pixel ice, drawn in code (3x) until its own art arrives.
  drawnIceScoop() {
    const key = 'toolIceScoopDrawn';
    if (this.textures.exists(key)) return key;
    const tex = this.textures.createCanvas(key, 180, 126);
    const ctx = tex.getContext();
    const ink = '#3a2e2a';
    const steel = (fill) => {
      ctx.fillStyle = fill;
      ctx.lineWidth = 6;
      ctx.strokeStyle = ink;
    };
    // handle, off to the right
    steel('#b9bfc6');
    ctx.beginPath();
    ctx.roundRect(96, 70, 80, 22, 11);
    ctx.fill();
    ctx.stroke();
    // the heap of ice in the bowl (pixel art: scaled without smoothing)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.textures.get('iceCluster').getSourceImage(), 10, 8, 87, 57);
    ctx.drawImage(this.textures.get('iceCluster').getSourceImage(), 28, 0, 70, 46);
    // the bowl's front, covering the bottom of the heap
    steel('#c9ced4');
    ctx.beginPath();
    ctx.moveTo(6, 56);
    ctx.lineTo(110, 56);
    ctx.lineTo(100, 112);
    ctx.quadraticCurveTo(58, 124, 16, 112);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f4f6f8';
    ctx.fillRect(20, 64, 8, 38); // shine
    tex.refresh();
    return key;
  }

  // Mid-pour: swap in the tool's tilted pour picture (or just tilt it when it has none).
  poseTool(tool, pouring) {
    const t = tool.tool;
    if (!t.pourSprite || !tool.sprite) return tool.setAngle(pouring ? -38 : 0);
    const key = pouring ? t.pourSprite : t.sprite;
    if (tool.sprite.texture.key === key) return;
    tool.sprite.setTexture(key);
    const h = pouring ? displayHeight(key) : t.spriteH ?? displayHeight(key);
    tool.sprite.setScale(h / tool.sprite.height);
  }

  onToolDragEnd(tool, p) {
    this.dragging = Math.max(0, this.dragging - 1);
    const t = tool.tool;
    const slot = this.slotAt(p.worldX, p.worldY - LIFT + t.h / 2);
    if (t.kind === 'drop' && slot?.cup) this.dropOnCup(slot, t.apply);
    if (t.kind === 'pour' && this.dosed(t) && slot?.cup) this.dose(slot, t.ingredient);
    if (t.kind === 'stir' && slot?.cup?.base) this.autoStir(slot); // drop the spoon on a cup: it stirs itself
    if (t.kind === 'rack' && slot && !slot.cup) this.placeCup(slot);
    this.pouring = null;
    this.poseTool(tool, false);
    this.liftTool(tool, false);
    tool.setAngle(0);
    // While it glides home it passes BEHIND the cups (depth 14), so a quick tap on a cup still
    // grabs the cup, but the tool itself can be grabbed again straight away.
    tool.setDepth(13);
    this.tweens.add({ targets: tool, x: tool.home.x, y: tool.home.y, scale: 1, duration: 160, ease: 'Quad.out', onComplete: () => tool.setDepth(20) });
  }

  // Shared by the drag UI, the tutorial and tests (window.__stall in dev).
  pourInto(slot, ingredient, dtMs) {
    if (!slot?.cup) return;
    this.focusSlot = slot;
    const fast = ['kopi', 'teh', ...MALT].includes(ingredient) ? this.perks.pourMult : 1; // Long-Spout Pot
    pour(slot.cup, ingredient, dtMs * fast);
    this.recheckCup(slot);
    this.pourBar.show(ingredient, slot.cup, slot.i + 1, slot.ticket);
  }

  dropOnCup(slot, what) {
    this.focusSlot = slot;
    if (what === 'ice') addIce(slot.cup);
    else addPowder(slot.cup);
    play('ice');
    this.recheckCup(slot);
  }

  // Sugar Scoop / Milk Pump (night shop): these pour in fixed doses, one zone each.
  dosed(t) {
    return (t.ingredient === 'sugar' && this.perks.sugarScoop) || (['condensed', 'evap'].includes(t.ingredient) && this.perks.milkPump);
  }

  dose(slot, ingredient) {
    const ms = (TUNING.doseAmount * 1000) / TUNING.pourPerSec[ingredient];
    pour(slot.cup, ingredient, ms);
    slot.art.update(slot.cup, 0, { ingredient });
    this.focusSlot = slot;
    this.recheckCup(slot);
    this.pourBar.show(ingredient, slot.cup, slot.i + 1, slot.ticket);
    play(ingredient === 'sugar' ? 'sugar' : 'milk');
  }

  // The spoon stirs the cup by itself: a little animation while the milk swirls in.
  autoStir(slot) {
    if (slot.stirring) return;
    slot.stirring = true;
    const ms = this.perks.stirMs ?? TUNING.autoStirMs;
    slot.art.startStir(ms);
    this.focusSlot = slot;
    for (let i = 1; i <= TUNING.stirWigglesNeeded; i++) {
      this.time.delayedCall((ms / TUNING.stirWigglesNeeded) * i, () => slot.cup && slot.cup.stir < 1 && this.stirCup(slot));
    }
    this.time.delayedCall(ms, () => (slot.stirring = false));
  }

  stirCup(slot) {
    stirStep(slot.cup);
    play('stir');
    this.redrawSlot(slot);
    this.tweens.add({ targets: slot.container, angle: { from: -3, to: 3 }, duration: 60, yoyo: true, onComplete: () => slot.container.setAngle(0) });
  }

  // ---------- customers ----------

  waitingCustomers() {
    return [...new Set([...this.spots, this.tableGuest])].filter((c) => c?.state === 'waiting');
  }

  allCustomers() {
    return [...new Set([...this.spots, this.tableGuest])].filter(Boolean);
  }

  freeSpots() {
    return this.spots.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  }

  // Where this customer would go right now: 'table', 'counter', 'queue' or null (no room).
  placeFor(def) {
    if (def.slot === 'table') return this.tableGuest ? null : 'table';
    const group = def.groupSize > 1;
    return placeArrival({ freeSpots: this.freeSpots().length, totalSpots: this.spots.length, lineLength: this.queue.length, max: this.queueMax, group });
  }

  // What this customer could order today (the recipe calendar + machines bought).
  menuOf(def) {
    return ordersFor(def.orders, this.day, this.perks.features, this.freshFeatures);
  }

  // forcedId / forcedOrder let the schedule (a regular), the tutorial, the story (and tests) bring in a
  // specific character + order. No id = a random walk-in.
  spawnCustomer(forcedId = null, forcedOrder = null) {
    if (this.ended || this.closing) return null;
    const forced = forcedId && CUSTOMERS.find((c) => c.id === forcedId);
    const here = new Set([...this.allCustomers(), ...this.queue].map((c) => c.def.id));
    const open = WALK_INS.filter((w) => this.menuOf(w).length && this.placeFor(w));
    const fresh = open.filter((w) => !here.has(w.id));
    const pool = fresh.length ? fresh : open; // no twins at the counter unless every kind is already here
    const def = forcedId ? (forced && this.placeFor(forced) ? forced : null) : pool.length ? weightedPick(pool) : null;
    if (!def) return null;

    const place = this.placeFor(def);
    const orderText = forcedOrder ?? (def.regular ? regularOrder(def.usual, this.menuOf(def), TUNING.regularVariety) : weightedPick(this.menuOf(def)).text);
    if (!orderText) return null;
    this.cameToday.add(def.id);
    const n = def.groupSize;
    const c = {
      def,
      spot: null,
      orderText,
      spec: parseOrder(orderText),
      n,
      served: 0,
      state: 'walking',
      patienceMax: def.patience * 1000 * TUNING.patienceScale * this.perks.patienceMult,
      patienceMs: def.patience * 1000 * TUNING.patienceScale * this.perks.patienceMult,
      bubble: null,
    };
    c.orderLine = pickLine(def.lines, 'order', this.lineVars({ order: orderText, n }));

    if (place === 'table') {
      c.spot = 'table';
      this.tableGuest = c;
      c.sprites = [addSprite(this, def.sprite, TABLE.x, TABLE.feetY, TABLE.h).setDepth(2).setAlpha(0)];
      this.tweens.add({ targets: c.sprites, alpha: 1, duration: 500, onComplete: () => this.arrive(c) });
      return c;
    }
    const keys = n > 1 ? (def.sprites ?? Array(n).fill(def.sprite)).slice(0, n) : [def.sprite];
    c.sprites = keys.map((key, i) => {
      const s = addSprite(this, key, ENTRY.x - i * 18, ENTRY.feetY - (i % 2) * 3).setDepth(2);
      return s.setScale(s.baseScale * this.scaleAt(s.y));
    });
    if (place === 'counter') this.takeSpot(c);
    else {
      c.state = 'queued';
      this.queue.push(c);
      this.walkToQueue(c, this.queue.length - 1);
    }
    return c;
  }

  // Send a customer (walking in, or the front of the queue) to a free counter spot.
  takeSpot(c) {
    c.spot = c.n > 1 ? 'all' : Phaser.Utils.Array.GetRandom(this.freeSpots());
    if (c.n > 1) this.spots = this.spots.map(() => c);
    else this.spots[c.spot] = c;
    c.state = 'walking';
    const xs = c.n > 1 ? GROUP_X.slice(0, c.n) : [SPOT_X[c.spot]];
    let walking = c.sprites.length;
    c.sprites.forEach((s, i) => {
      s.setDepth(3 + (i % 2 ? 0 : 0.5));
      this.walk(s, xs[i], FEET_Y - (i % 2) * 4, i * 120, () => --walking === 0 && this.arrive(c));
    });
  }

  walkToQueue(c, idx) {
    const p = QUEUE_POS[Math.min(idx, QUEUE_POS.length - 1)];
    c.sprites.forEach((s, i) => this.walk(s, p.x - i * 14, p.feetY - (i % 2) * 3, i * 120));
  }

  // A spot freed up: the front of the line walks up (a group waits for the whole counter).
  advanceQueue() {
    for (let front; !this.ended && (front = frontCanTake(this.queue, this.freeSpots().length, this.spots.length)); ) {
      this.queue.shift();
      this.takeSpot(front);
    }
    this.queue.forEach((c, i) => this.walkToQueue(c, i));
  }

  // Size by distance: small at the street opening, full size at the counter.
  scaleAt(feetY) {
    const t = Phaser.Math.Clamp((feetY - ENTRY.feetY) / (FEET_Y - ENTRY.feetY), 0, 1);
    return TUNING.walkFarScale + (1 - TUNING.walkFarScale) * t;
  }

  // Walk a sprite to (x, y). Plays the `<key>-walk` animation when that character has walk
  // frames; otherwise waddles the still (a step bob + a little side-to-side tilt).
  walk(s, x, y, delay = 0, done = null) {
    s.walkTween?.stop();
    const key = (s.homeKey ??= s.texture.key);
    const anim = `${key}-walk`;
    const frames = this.anims.exists(anim);
    const from = { x: s.x, y: s.y + (s.bob ?? 0) };
    const duration = Math.max(250, (Phaser.Math.Distance.Between(from.x, from.y, x, y) / TUNING.walkSpeed) * 1000);
    const steps = duration / 280;
    const p = { t: 0 };
    if (frames) s.play(anim);
    s.walkTween = this.tweens.add({
      targets: p, t: 1, duration, delay, ease: 'Sine.inOut',
      onUpdate: () => {
        const gy = Phaser.Math.Linear(from.y, y, p.t);
        const phase = p.t * steps * Math.PI;
        s.bob = frames ? 0 : Math.abs(Math.sin(phase)) * 4;
        s.setPosition(Phaser.Math.Linear(from.x, x, p.t), gy - s.bob);
        s.setAngle(frames ? 0 : Math.sin(phase) * 4);
        s.setScale(s.baseScale * this.scaleAt(gy));
      },
      onComplete: () => {
        s.bob = 0;
        s.walkTween = null;
        s.setPosition(x, y).setAngle(0).setScale(s.baseScale * this.scaleAt(y));
        if (frames) s.stop().setTexture(key);
        done?.();
      },
    });
  }

  lineVars(extra = {}) {
    return { owner: this.owner.address, ...extra };
  }

  arrive(c) {
    if (c.state === 'gone') return;
    c.state = 'waiting';
    c.arrivedAt = this.clockMs;
    this.showBubble(c, c.orderLine, 'order');
    for (const sl of this.slots) if (sl.cup && !sl.ticket) this.assignCup(sl);
    if (c.lesson) this.time.delayedCall(500, () => !this.ended && this.showLesson(c.lessonLine));
    if (c.episode) {
      this.time.delayedCall(900, () => {
        if (this.ended) return; // closing time plays it instead
        this.storyCue(c, () => {
          if (this.ended) return;
          this.guestEpisode = null;
          this.playEpisode(c.episode);
        });
      });
    }
  }

  // A story is about to happen: a "!" pops up over the guest's head first.
  storyCue(c, then) {
    const s = c.sprites[0];
    const mark = addText(this, this.centerX(c), s.y - s.displayHeight - 6, '!', { size: 26, bold: true, color: '#f2c14e', origin: [0.5, 1] }).setDepth(45);
    mark.setStroke('#3a2414', 5).setScale(0);
    play('tap');
    this.tweens.add({ targets: mark, scale: 1, duration: 260, ease: 'Back.out' });
    this.time.delayedCall(900, () => {
      mark.destroy();
      then();
    });
  }

  centerX(c) {
    return c.spot === 'table' ? TABLE.x : c.spot === 'all' ? GAME_W / 2 : SPOT_X[c.spot];
  }

  showBubble(c, text, kind) {
    this.clearBubble(c);
    const pad = 6;
    const table = c.spot === 'table';
    const w = table ? TABLE.bubble.w : c.spot === 'all' ? 220 : 114;
    const x = table ? TABLE.bubble.x : Phaser.Math.Clamp(this.centerX(c) - w / 2, 4, GAME_W - w - 4);
    const words = layoutLine(this, text, x + pad, 0, w - pad * 2, (key) => this.openGlossary(key), { size: 11 });
    const extras = [];
    let h = words.height + pad * 2;
    if (kind === 'order' && c.n > 1) {
      extras.push(addText(this, x + pad, 0, `Cup ${c.served + 1}/${c.n}`, { size: 10, color: '#8a7a70' }));
    }
    if (kind === 'order') h += 8; // patience bar
    h += extras.reduce((sum, o) => sum + o.height + 1, 0);
    const y = table ? TABLE.bubble.y : BUBBLE_BOTTOM - h;
    words.objects.forEach((o) => o.setY(o.y + y + pad));
    let ey = y + pad + words.height;
    for (const o of extras) {
      o.setY(ey);
      ey += o.height + 1;
    }
    const frame = this.add.rectangle(x, y, w, h, 0xffffff).setOrigin(0).setStrokeStyle(2, COLORS.inkHex, 0.8).setDepth(30);
    const tx = table ? x + 6 : Phaser.Math.Clamp(this.centerX(c), x + 12, x + w - 12);
    const tail = table
      ? this.add.triangle(0, 0, x + 1, y + 16, x + 1, y + 28, x - 9, y + 24, 0xffffff).setOrigin(0).setDepth(30)
      : this.add.triangle(0, 0, tx - 7, y + h - 1, tx + 7, y + h - 1, tx, y + h + 8, 0xffffff).setOrigin(0).setDepth(30);
    [...words.objects, ...extras].forEach((o) => o.setDepth(31));
    const objs = [frame, tail, ...words.objects, ...extras];
    let bar = null;
    if (kind === 'order') {
      objs.push(this.add.rectangle(x + pad, y + h - 9, w - pad * 2, 5, 0xe0d6c4).setOrigin(0).setDepth(31));
      bar = this.add.rectangle(x + pad, y + h - 9, w - pad * 2, 5, COLORS.good).setOrigin(0).setDepth(32);
      bar.fullW = w - pad * 2;
      objs.push(bar);
    }
    c.bubble = { objs, frame, bar };
    this.updatePatienceBar(c);
  }

  clearBubble(c) {
    c?.bubble?.objs.forEach((o) => {
      this.tweens.killTweensOf(o);
      o.destroy();
    });
    if (c) c.bubble = null;
  }

  updatePatienceBar(c) {
    const bar = c.bubble?.bar;
    if (!bar) return;
    const f = Phaser.Math.Clamp(c.patienceMs / c.patienceMax, 0, 1);
    bar.width = Math.max(0, Math.round(bar.fullW * f));
    bar.fillColor = f > 0.35 ? COLORS.good : COLORS.accent;
    if (f <= 0.35 && !c.bubble.shaking) {
      c.bubble.shaking = true;
      this.tweens.add({ targets: bar, x: '+=2', duration: 70, yoyo: true, repeat: -1 });
    }
  }

  // Which waiting customer is at this point (their sprites or their bubble)?
  customerAt(x, y) {
    for (const c of this.waitingCustomers()) {
      const rects = [...c.sprites.map((s) => s.getBounds()), c.bubble?.frame.getBounds()].filter(Boolean);
      if (rects.some((r) => Phaser.Geom.Rectangle.Contains(Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(r), 6, 6), x, y))) return c;
    }
    return null;
  }

  highlightCustomer(c) {
    for (const o of this.allCustomers()) o.bubble?.frame.setStrokeStyle(o === c ? 4 : 2, o === c ? COLORS.accent : COLORS.inkHex, 0.9);
  }

  serveCup(slot, c) {
    const cup = slot.cup;
    let { tier, reasons } = gradeCup(cup, c.spec);
    // Uncle Tan's towel forgives the first spill of the day
    if (this.perks.towel && !this.towelUsed && reasons.includes('spilled over')) {
      this.towelUsed = true;
      reasons = reasons.filter((r) => r !== 'spilled over');
      tier = reasons.length ? tier : 'perfect';
      this.time.delayedCall(900, () => this.setFeedback("Uncle Tan's towel wiped the spill!"));
    }
    const res = applyServe(this.econ, tier, c.spec);
    // night-shop tip bonuses: tip jar, cup warmer (hot), ice machine (peng)
    if (tier !== 'oops') {
      const hot = !c.spec.iced && !MALT.includes(c.spec.base);
      const extra = Math.round(res.tip * (this.perks.tipMult - 1)) + (hot ? this.perks.hotTip : 0) + (c.spec.iced ? this.perks.icedTip : 0);
      if (extra) {
        res.tip += extra;
        this.econ.money += extra;
        this.econ.earnedToday += extra;
        this.econ.tipsToday += extra;
      }
    }
    c.served += 1;
    c.state = 'reacting';
    logEvent(this.log, 'serve', { who: c.def.id, wanted: c.orderText, made: formatCup(cup), tier, reasons, waitMs: Math.round(c.patienceMax - c.patienceMs) }, this.clockMs);
    this.tutorial?.onServed(c, tier);
    this.removeCup(slot);
    if (this.perks.autoCup) this.time.delayedCall(350, () => !slot.cup && !this.ended && this.placeCup(slot)); // Cup Rack Pro

    play('clink');
    this.time.delayedCall(140, () => play('coin'));
    this.time.delayedCall(420, () => play(tier === 'oops' ? 'oops' : tier === 'perfect' ? 'perfect' : 'tap'));
    const reply = pickLine(c.def.lines, tier, this.lineVars());
    if (tier === 'perfect') this.log.events.at(-1).line = reply;
    this.showBubble(c, reply, 'reaction');
    this.floatText(`+${formatMoney(res.paid + res.tip)}`, this.centerX(c), this.headTop(c) + 10);
    this.coinBurst(c);
    if (tier === 'perfect') this.happyHop(c);
    const label = { perfect: 'Perfect!', close: 'Close', oops: 'Oops' }[tier];
    const why = reasons.length ? ` — ${reasons.slice(0, 2).join(', ')}` : '';
    this.setFeedback(`${label}${why}  +${formatMoney(res.paid + res.tip)}`);
    this.refreshHud();

    if (c.served < c.n) {
      this.time.delayedCall(1200, () => {
        if (c.state === 'gone' || this.ended) return;
        c.state = 'waiting';
        c.patienceMs = Math.min(c.patienceMax, c.patienceMs + TUNING.groupCupBonusMs);
        this.showBubble(c, c.orderLine, 'order');
      });
    } else {
      this.time.delayedCall(c.spot === 'table' ? TABLE_LINGER_MS : 1400, () => this.leave(c));
    }
  }

  headTop(c) {
    return Math.min(...c.sprites.map((s) => s.getBounds().top));
  }

  timeout(c) {
    c.state = 'reacting';
    applyTimeout(this.econ);
    logEvent(this.log, 'timeout', { who: c.def.id }, this.clockMs);
    play('walkout');
    this.showBubble(c, pickLine(c.def.lines, 'timeout', this.lineVars()), 'reaction');
    this.setFeedback('They wandered off... 名气 -1');
    this.refreshHud();
    this.time.delayedCall(1600, () => this.leave(c));
  }

  leave(c) {
    if (c.state === 'gone') return;
    c.state = 'gone';
    this.clearBubble(c);
    if (c === this.tableGuest) this.tableGuest = null;
    this.spots = this.spots.map((s) => (s === c ? null : s));
    for (const sl of this.slots) if (sl.ticket?.c === c && sl.cup) this.assignCup(sl);
    c.sprites.forEach((s) => this.tweens.add({ targets: s, alpha: 0, y: s.y - 12, duration: 450, onComplete: () => s.destroy() }));
    this.time.delayedCall(350, () => this.advanceQueue());
  }

  // ---------- juice / feedback ----------

  floatText(str, x, y) {
    const t = addText(this, x, y, str, { size: 16, bold: true, color: '#2f7a3a', origin: 0.5 }).setDepth(60);
    this.tweens.add({ targets: t, y: y - 32, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }

  coinBurst(c) {
    const from = { x: this.centerX(c), y: this.headTop(c) + 30 };
    for (let i = 0; i < 4; i++) {
      const coin = this.add.circle(from.x, from.y, 5, 0xf2c14e).setStrokeStyle(1, 0xb8862b).setDepth(61);
      this.tweens.add({
        targets: coin, x: GAME_W - 30, y: 14, duration: 520, delay: 120 + i * 70, ease: 'Cubic.in',
        onComplete: () => {
          coin.destroy();
          if (i === 3) this.tweens.add({ targets: this.hudMoney, scale: 1.18, duration: 90, yoyo: true });
        },
      });
    }
  }

  happyHop(c) {
    c.sprites.forEach((s, i) => this.tweens.add({ targets: s, y: s.y - 10, duration: 110, yoyo: true, repeat: 1, delay: 300 + i * 50, ease: 'Quad.out' }));
  }

  setFeedback(str) {
    this.feedback.setText(str).setAlpha(1);
    this.tweens.killTweensOf(this.feedback);
    this.tweens.add({ targets: this.feedback, alpha: 0, delay: 3000, duration: 600 });
  }

  openGlossary(key) {
    if (this.paused) return;
    this.paused = true;
    logEvent(this.log, 'glossary', { key }, this.clockMs);
    this.tweens.pauseAll();
    this.time.paused = true;
    showGlossary(this, key, () => {
      this.paused = false;
      this.tweens.resumeAll();
      this.time.paused = false;
    });
  }

  // ---------- clock / HUD ----------

  refreshHud() {
    const mins = OPEN_MIN + Math.floor((this.clockMs / TUNING.dayMs) * (CLOSE_MIN - OPEN_MIN));
    const h24 = Math.floor(mins / 60);
    const mm = String(Math.floor((mins % 60) / 15) * 15).padStart(2, '0');
    const h12 = ((h24 + 11) % 12) + 1;
    this.hudDay.setText(`Day ${this.day}/${MONTH_DAYS}   ${h12}:${mm}${h24 < 12 ? 'am' : 'pm'}`);
    // clock hands (smooth) and the day-bar marker
    const exact = OPEN_MIN + (this.clockMs / TUNING.dayMs) * (CLOSE_MIN - OPEN_MIN);
    const ha = ((exact / 60) % 12) / 12 * Math.PI * 2;
    const ma = ((exact % 60) / 60) * Math.PI * 2;
    this.hourHand.setRotation(ha);
    this.minuteHand.setRotation(ma);
    const period = PERIODS.findIndex(([, a, b]) => exact - OPEN_MIN >= a && exact - OPEN_MIN < b);
    this.periodIcon.setTexture(PERIOD_ICONS[Math.max(0, period)]).setX(this.hudDay.x + this.hudDay.width + 10);
    const mx = this.dayBar.x + (this.clockMs / TUNING.dayMs) * this.dayBar.w;
    this.dayMarker.clear().fillStyle(0xc8402c, 1).fillRect(mx - 1.5, this.dayBar.y - 3, 3, this.dayBar.h + 6);
    this.hudFame.setText(`名气 ${Math.floor(this.econ.fame)}`);
    this.hudMoney.setText(formatMoney(this.econ.money));
    this.hudCoin.setX(GAME_W - 8 - this.hudMoney.width - 10);
  }

  update(time, delta) {
    if (this.paused) return;
    for (const s of this.slots) {
      s.art.update(s.cup, delta, this.pouring?.slot === s ? { ingredient: this.pouring.tool.tool.ingredient } : null, this.targetFill(s));
      s.art.draw();
    }
    if (this.ended) return;

    // pouring while a tool is held over a cup
    if (this.pouring) {
      const { tool, slot } = this.pouring;
      const ing = tool.tool.ingredient;
      this.pourInto(slot, ing, delta);
      const gap = ing === 'sugar' ? 220 : 900;
      if (time - this.lastPourSound > gap) {
        play(ing === 'sugar' ? 'sugar' : ['condensed', 'evap'].includes(ing) ? 'milk' : 'pour');
        this.lastPourSound = time;
      }
    }
    this.pourBar.update();
    this.updateCoach(delta);

    // The tutorial is a calm intro: the day clock and random spawns wait for it.
    const teaching = this.tutorial?.active;
    if (!teaching) this.clockMs = Math.min(TUNING.dayMs, this.clockMs + delta);
    this.refreshHud();
    if (this.clockMs >= TUNING.dayMs) {
      // 7pm: no one new comes in, but the customers already here still get their drinks
      if (!this.closing) this.startClosing();
      this.overtimeMs += delta;
      const empty = !this.allCustomers().length && !this.queue.length;
      if (empty || this.overtimeMs > TUNING.closingGraceMs) return this.endDay();
    }

    if (!teaching) {
      this.runArrivals();
      this.maybeMidStory(delta);
      this.maybeBringTeacher();
    }

    for (const c of this.waitingCustomers()) {
      if (c.tutorial) continue; // no time pressure while learning
      c.patienceMs -= delta;
      this.updatePatienceBar(c);
      if (c.patienceMs <= 0) this.timeout(c);
    }
  }

  // Bring in whoever is due by now: a regular (id) or a random walk-in (no id). No room (queue full)?
  // They try again a bit later. A regular a lesson or story already brought in today doesn't come twice.
  runArrivals() {
    while (this.arrivals.length && this.arrivals[0].at <= this.clockMs) {
      if (this.clockMs > TUNING.dayMs - TUNING.lastSpawnBeforeEndMs) return (this.arrivals = []);
      const next = this.arrivals[0];
      if (next.id && this.cameToday.has(next.id)) this.arrivals.shift();
      else if (this.spawnCustomer(next.id)) this.arrivals.shift();
      else {
        next.at = this.clockMs + TUNING.queueRetryMs;
        this.arrivals.sort((a, b) => a.at - b.at);
        return;
      }
    }
  }

  // ---------- story episodes ----------

  maybeMidStory(delta) {
    if (this.storyDone.has('mid') || this.clockMs < TUNING.dayMs * MID_STORY_AT) return;
    this.midWaitMs += delta;
    if ((!this.dragging && !this.pouring) || this.midWaitMs > DRAG_WAIT_MS) this.playStory('mid');
  }

  // Called by the tutorial when it finishes or is skipped.
  onTutorialDone() {
    this.time.delayedCall(1200, () => this.playStory('start'));
  }

  // Play today's episode for this moment (if any), then carry on.
  playStory(when, then = () => {}) {
    if (this.storyDone.has(when)) return then();
    this.storyDone.add(when);
    const ep = eventsFor(EVENTS, this.day, when)[0];
    if (!ep) return then();
    if (ep.guest && when !== 'end') {
      this.bringGuest(ep);
      return then();
    }
    this.playEpisode(ep, then);
  }

  // The episode's customer comes in first; it plays when they reach the counter.
  bringGuest(ep) {
    if (this.ended) return;
    this.guestEpisode = ep; // still owed: plays at closing if they never reach the counter
    const c = this.spawnCustomer(ep.guest.id, ep.guest.order);
    if (c) c.episode = ep;
    else this.time.delayedCall(1000, () => this.bringGuest(ep));
  }

  // Pause the stall and play an episode on top (scenes/DramaScene.js).
  playEpisode(ep, then = () => {}) {
    this.pouring = null;
    this.tweens.killTweensOf(this.feedback);
    this.feedback.setAlpha(0);
    this.scene.launch('Drama', {
      ep,
      flags: this.flags,
      fame: this.econ.fame,
      vars: this.lineVars({ rating: this.rating ?? this.todayRating() }),
      owner: { name: this.owner.name, sprite: this.owner.sprite },
      onChoice: (opt) => this.applyStoryChoice(opt),
      onEnding: (e) => (this.ending = e.id),
      onDone: () => {
        this.scene.stop('Drama');
        this.scene.resume();
        if (ep.fame) this.econ.fame = clampFame(this.econ.fame + ep.fame);
        for (let i = 0; i < (ep.rush ?? 0); i++) this.arrivals.push({ at: this.clockMs + 800 + i * 2500, id: null });
        this.arrivals.sort((a, b) => a.at - b.at);
        logEvent(this.log, 'story', { id: ep.id, flags: this.flags.join(',') }, this.clockMs);
        this.refreshHud();
        if (this.lesson?.afterStory === ep.id && this.lessonState === 'waiting') this.time.delayedCall(300, () => this.showLesson(true));
        then();
      },
    });
    this.scene.pause();
  }

  applyStoryChoice(opt) {
    const s = applyChoice({ flags: this.flags, fame: this.econ.fame, money: this.econ.money }, opt);
    this.flags = s.flags;
    this.econ.fame = s.fame;
    this.econ.earnedToday += s.money - this.econ.money;
    this.econ.money = s.money;
  }

  todayRating() {
    return auntyRating(this.econ.perfect, this.econ.served);
  }

  // ---------- recipe calendar ----------

  // On a lesson day (not taught by a story episode), the teacher walks in early with the new order.
  nextLesson() {
    this.lesson = this.lessons.shift() ?? null;
    this.lessonState = this.lesson ? 'waiting' : 'none';
    this.lessonAt = Math.max(LESSON_AT_MS, (this.clockMs ?? 0) + 8000);
  }

  maybeBringTeacher() {
    const l = this.lesson;
    if (this.lessonState !== 'waiting' || l.afterStory || this.clockMs < this.lessonAt) return;
    const real = CUSTOMERS.find((c) => c.id === l.teacher);
    const who = real?.enabled && real.sprite ? real.id : l.fallback ?? l.teacher;
    // already at the stall? they change their order to the new recipe (no twin walks in)
    const here = [...this.allCustomers(), ...this.queue].find((c) => c.def.id === who);
    if (here && (here.state === 'reacting' || here.state === 'gone' || here.served)) return; // wait till they've gone
    const c = here ?? this.spawnCustomer(who, l.order);
    if (!c) return; // no room yet: try again next frame
    if (here) {
      c.orderText = l.order;
      c.spec = parseOrder(l.order);
      c.orderLine = pickLine(c.def.lines, 'order', this.lineVars({ order: l.order, n: c.n }));
      if (c.state === 'waiting') {
        this.showBubble(c, c.orderLine, 'order');
        this.time.delayedCall(400, () => !this.ended && this.showLesson(who === l.teacher));
      }
    }
    this.lessonState = 'coming';
    c.lesson = true;
    c.lessonLine = who === l.teacher; // a stand-in teacher doesn't say the real teacher's line
    c.patienceMs = c.patienceMax = c.patienceMax * 1.5; // learning takes a moment
  }

  // Pause the day for a modal card; resume when it closes.
  pauseFor(open) {
    if (this.paused) return;
    this.paused = true;
    this.pouring = null;
    this.tweens.pauseAll();
    this.time.paused = true;
    open(() => {
      this.paused = false;
      this.tweens.resumeAll();
      this.time.paused = false;
    });
  }

  showLesson(showLine = true) {
    if (this.lessonState === 'done') return;
    this.lessonState = 'done';
    logEvent(this.log, 'lesson', { day: this.day, features: this.lesson.features.join(',') }, this.clockMs);
    this.pauseFor((resume) => showRecipeCard(this, this.lesson, { showLine, onClose: () => (resume(), this.nextLesson()) }));
  }

  // Everything bought in the night shop shows up at the stall (src/data/stallProps.js).
  drawStallProps() {
    for (const id of this.run.owned ?? []) {
      for (const p of STALL_PROPS[id] ?? []) {
        const s = addSprite(this, p.key, p.x, p.feet, p.h).setDepth(PROP_DEPTH[p.layer]);
        if (p.sign) {
          const name = addText(this, p.x + s.displayWidth * 0.1, p.feet - s.displayHeight * 0.38, `${this.owner.name}'s Kopi`, { size: 11, bold: true, color: '#ffe7a8', origin: 0.5 });
          name.setStroke('#4a1a10', 3).setDepth(PROP_DEPTH[p.layer] + 0.1);
        }
        if (p.anim === 'sway') {
          s.setOrigin(0.5, 0).setY(p.feet - s.displayHeight);
          this.tweens.add({ targets: s, angle: { from: -4, to: 4 }, duration: 1600 + p.x * 3, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        }
        if (p.anim === 'flicker') this.tweens.add({ targets: s, alpha: { from: 1, to: 0.78 }, duration: 90, yoyo: true, repeat: -1, repeatDelay: 2600 + p.x * 7 });
        if (p.anim === 'twinkle') this.tweens.add({ targets: s, alpha: { from: 1, to: 0.7 }, duration: 900, yoyo: true, repeat: -1, delay: p.x * 4, ease: 'Sine.inOut' });
        if (p.anim === 'breathe') this.tweens.add({ targets: s, scaleY: s.scaleY * 1.04, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
    }
  }

  // Wall Menu Board (night shop): today's drinks on a little board on the wall.
  drawMenuBoard() {
    const known = unlockedFeatures(this.day, this.perks.features);
    const names = Object.values(DRINKS).filter((d) => d.base && (known.has(d.base) || (d.topping && known.has(`${d.base}Dino`))) && (d.milk !== 'none' || known.has('O')) && (d.milk !== 'evap' || known.has('C'))).map((d) => d.name);
    const x = GAME_W - 76;
    const y = HUD_H + 34;
    const lines = names.slice(0, 9);
    // the board art, nine-sliced so its frame stays crisp at any length (the texture is 3x display size)
    const board = this.add.nineslice(x, y, 'propMenuBoard', null, 70 * 3, (18 + lines.length * 10) * 3, 18, 18, 18, 18).setOrigin(0).setScale(1 / 3).setDepth(1);
    addText(this, x + 35, y + 3, 'MENU 菜单', { size: 8, bold: true, color: '#ffd28a', origin: [0.5, 0] }).setDepth(1);
    lines.forEach((n, i) => addText(this, x + 6, y + 14 + i * 10, n, { size: 7.5, color: '#f4efe2' }).setDepth(1));
    return board;
  }

  openRecipeBook() {
    if (this.ended) return;
    this.pauseFor((resume) => showRecipeBook(this, this.day, resume));
  }

  // ---------- day end ----------

  startClosing() {
    this.closing = true;
    this.overtimeMs = 0;
    this.arrivals = [];
    play('dayEnd');
    // the queue is politely turned away; the counter still gets served
    const q = this.queue;
    this.queue = [];
    q.forEach((c) => this.leave(c));
    this.setFeedback(q.length ? '7pm! Closing time — sorry, queue. Serving the last customers.' : '7pm! Closing time — serving the last customers.');
    this.hudDay.setColor('#ffd28a');
  }

  // A rolling shutter comes down with "收档啦!", then the end-of-day story and the summary.
  // The stall's metal roller shutter (below the HUD), as a container at y.
  makeShutter(y, depth) {
    const h = GAME_H - HUD_H;
    const shutter = this.add.container(0, y).setDepth(depth);
    const g = this.add.graphics();
    g.fillStyle(0x8a96a2, 1).fillRect(0, HUD_H, GAME_W, h);
    for (let yy = HUD_H + 6; yy < GAME_H; yy += 12) g.fillStyle(0x6c7782, 1).fillRect(0, yy, GAME_W, 3).fillStyle(0xb3bdc6, 1).fillRect(0, yy + 3, GAME_W, 1);
    g.fillStyle(0x4b545c, 1).fillRect(0, GAME_H - 14, GAME_W, 14);
    g.fillStyle(0x2b2b2b, 1).fillRoundedRect(GAME_W / 2 - 22, GAME_H - 26, 44, 10, 4); // handle
    shutter.add(g);
    return shutter;
  }

  // Morning after the night: fade in on the closed shutter, "Day N · 早安!", then it rolls up.
  openShutter() {
    const depth = 66;
    const shutter = this.makeShutter(0, depth);
    const big = addText(this, GAME_W / 2, GAME_H / 2 - 40, `Day ${this.day}`, { size: 40, bold: true, color: '#fff6dc', origin: 0.5 }).setDepth(depth + 1);
    const small = addText(this, GAME_W / 2, GAME_H / 2 + 6, '早安! Good morning · 开档啦', { size: 16, bold: true, color: '#fff6dc', origin: 0.5 }).setDepth(depth + 1);
    big.setStroke('#3a2414', 6);
    small.setStroke('#3a2414', 4);
    this.cameras.main.fadeIn(500, 11, 20, 48);
    this.tweens.add({ targets: [big, small], alpha: 0, duration: 250, delay: 1000 });
    this.tweens.add({ targets: shutter, y: -(GAME_H - HUD_H), duration: 750, delay: 1100, ease: 'Cubic.in', onStart: () => play('pickup'), onComplete: () => [shutter, big, small].forEach((o) => o.destroy()) });
  }

  closeShutter(then) {
    const depth = 66;
    const shutter = this.makeShutter(-(GAME_H - HUD_H), depth);
    this.tweens.add({ targets: shutter, y: 0, duration: 950, ease: 'Bounce.out', onComplete: () => play('clink') });
    const big = addText(this, GAME_W / 2, GAME_H / 2 - 40, '收档啦!', { size: 40, bold: true, color: '#fff6dc', origin: 0.5 }).setDepth(depth + 1).setScale(0);
    const small = addText(this, GAME_W / 2, GAME_H / 2 + 6, `Stall closed · Day ${this.day} done`, { size: 16, bold: true, color: '#fff6dc', origin: 0.5 }).setDepth(depth + 1).setAlpha(0);
    big.setStroke('#3a2414', 6);
    small.setStroke('#3a2414', 4);
    this.tweens.add({ targets: big, scale: 1, duration: 420, delay: 850, ease: 'Back.out' });
    this.tweens.add({ targets: small, alpha: 1, duration: 300, delay: 1100 });
    this.time.delayedCall(2000, () => {
      this.tweens.add({ targets: [big, small], alpha: 0, duration: 250 });
      then();
    });
  }

  endDay() {
    this.ended = true;
    this.setCoach('');
    this.pouring = null;
    this.arrivals = [];
    finishDay(this.log, this.econ);
    play('dayEnd');
    for (const c of [...this.allCustomers(), ...this.queue]) {
      c.state = 'gone';
      this.clearBubble(c);
      c.sprites.forEach((s) => {
        s.walkTween?.stop();
        this.tweens.add({ targets: s, alpha: 0, duration: 400, onComplete: () => s.destroy() });
      });
    }
    this.spots = [null, null, null];
    this.queue = [];
    this.tableGuest = null;
    this.setFeedback(UI.closing);
    this.rating = this.todayRating();
    // tonight's story first (with the stall still open behind it), then the shutter, then the summary
    const owed = this.guestEpisode;
    const shutter = () => this.closeShutter(() => this.showSummary());
    const story = () => this.playStory('end', shutter);
    this.time.delayedCall(600, () => (owed ? this.playEpisode(owed, story) : story()));
  }

  showSummary() {
    const e = this.econ;
    let tomorrow = nextDay(this.run, { money: e.money, fame: e.fame, flags: this.flags, rating: this.rating, ending: this.ending ?? this.run.ending });
    const gifted = GIFTS[this.day];
    if (gifted) tomorrow = gift(tomorrow, gifted);
    saveRun(tomorrow);
    const done = monthOver(tomorrow);

    const names = Object.fromEntries([...CUSTOMERS, ...WALK_INS].map((c) => [c.id, c.name]));
    const sum = summarizeDay(this.log, e, names);
    const depth = 70;
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.4).setOrigin(0).setDepth(depth).setInteractive();
    const cx = GAME_W / 2;
    const cardW = 320;
    const left = cx - cardW / 2 + 16;
    const items = [];
    const line = (str, o = {}, gap = 6, x = null) => items.push([addText(this, x ?? cx, 0, str, { size: 13, align: 'center', origin: [x === null ? 0.5 : 0, 0], wrap: cardW - 32, ...o }).setDepth(depth + 2), gap]);
    line(UI.dayDone.replace('{day}', this.day), { size: 22, bold: true }, 0);
    line(UI.dayDoneZh, { size: 14, color: '#6b5a50' }, 4);
    line('★'.repeat(sum.stars) + '☆'.repeat(3 - sum.stars), { size: 26, color: '#e0a21a' }, 6);
    const c = sum.counts;
    line(`${c.served} cups · ${c.perfect} perfect · ${c.close} close · ${c.oops} oops${c.walkedOut ? ` · ${c.walkedOut} left` : ''}`, {}, 4);
    line(`Sales ${formatMoney(sum.money.sales)}  ·  Tips ${formatMoney(sum.money.tips)}  ·  Total ${formatMoney(sum.money.total)}`, { bold: true }, 4);
    const gain = sum.fame.to - sum.fame.from;
    line(`名气 Fame ${sum.fame.from} → ${sum.fame.to} (${gain >= 0 ? '+' : ''}${gain})   ·   Aunty Lim's teh: ${this.rating}/10`, { size: 12, color: '#8a5a1e' }, 8);
    for (const r of sum.perCustomer.slice(0, 5)) {
      const bits = [r.perfect && `${r.perfect} perfect`, r.close && `${r.close} close`, r.oops && `${r.oops} oops`, r.walkedOut && `${r.walkedOut} left`].filter(Boolean).join(', ');
      line(`${r.name}: ${bits}`, { size: 12, align: 'left' }, 2, left);
    }
    if (sum.topSlips.length) line(`Most slips: ${sum.topSlips.map((t) => `${t.reason} ×${t.n}`).join(', ')}`, { size: 11, color: '#8a7a70', align: 'left' }, 2, left);
    line(`Uncle Tan says: ${sum.tip.en}`, { size: 12, color: '#2f7a3a', bold: true, align: 'left' }, 2, left);
    line(sum.tip.zh, { size: 11, color: '#6b5a50', align: 'left' }, 6, left);
    if (sum.quote) line(`${sum.quote.who}: "${sum.quote.line}"`, { size: 11, color: '#8a5a1e', align: 'left' }, 6, left);
    if (gifted) line("Uncle Tan left you his old towel. (It forgives one spill a day.)", { size: 11, color: '#8a5a1e', bold: true }, 6);
    if (!done) line(`Tomorrow: about ${customersForFame(e.fame) + this.perks.extraCustomers} customers`, { size: 11, color: '#8a7a70' }, 8);
    const textH = items.reduce((h, [t, gap]) => h + t.height + gap, 0);
    const cardH = 16 + textH + 8 + 54 + 6 + 30 + 6 + 28 + 14;
    const top = Math.max(6, Math.round((GAME_H - cardH) / 2));
    this.add.rectangle(cx - cardW / 2, top, cardW, cardH, COLORS.paper).setOrigin(0).setStrokeStyle(2, COLORS.inkHex).setDepth(depth + 1);
    let y = top + 16;
    for (const [t, gap] of items) {
      t.setY(y);
      y += t.height + gap;
    }
    y += 8;
    const button = (h, label, onTap, o) => {
      const b = makeButton(this, cx - 110, y, 220, h, label, onTap, o);
      b.bg.setDepth(depth + 2);
      b.txt.setDepth(depth + 3);
      y += h + 6;
      return b;
    };
    if (done) button(54, 'Month 1 complete  完', () => this.scene.start('Title'), { size: 17, bold: true, fill: 0xbfe3c0 });
    else if (this.day >= SHOP_FROM_DAY) button(54, 'Night shop ▸  供应商', () => this.toNight(tomorrow), { size: 17, bold: true, fill: 0xbfe3c0 });
    else button(54, 'Close up for the night ▸  收档', () => this.toNight(tomorrow), { size: 16, bold: true, fill: 0xbfe3c0 });
    button(30, UI.closeStall, () => this.scene.start('Title'), { size: 13 });
    const copy = button(28, 'Copy playtest notes', () => this.copyNotes(copy), { size: 12 });
  }

  // Night falls (a fade to deep blue), then the night shop opens.
  toNight(run) {
    if (this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(700, 11, 20, 48);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Shop', { run }));
  }

  copyNotes(btn) {
    const text = summarize(this.log);
    try {
      navigator.clipboard.writeText(text).then(() => btn.txt.setText('Copied!'), () => window.prompt('Copy these playtest notes:', text));
    } catch {
      window.prompt('Copy these playtest notes:', text);
    }
  }
}
