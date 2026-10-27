import Phaser from 'phaser';
import { GAME_W, GAME_H, COLORS } from '../config.js';
import { CUSTOMERS, WALK_INS } from '../data/customers.js';
import { OWNERS } from '../data/owners.js';
import { TOOLS, SLOT_X, SLOT_X4, SPOT_X, MACHINE_TOOLS, COUNTER, layoutRail, layoutCounter } from '../data/tools.js';
import { TUNING } from '../data/stallTuning.js';
import { pickLine, UI } from '../i18n/lines.js';
import { addText } from '../systems/text.js';
import { fitCamera } from '../systems/view.js';
import { addSprite, displayHeight } from '../systems/sprites.js';
import { needleAt, zoneAt, doseFor } from '../systems/dial.js';
import { makeButton, layoutLine, showGlossary, addMuteToggle } from '../systems/ui.js';
import { play } from '../systems/sfx.js';
import { parseOrder, plainOrder } from '../systems/order.js';
import { newCup, pour, addIce, addPowder, addExtra, stirStep, tarikStep, gradeCup, formatCup } from '../systems/cup.js';
import { DRINKS } from '../data/drinks.js';
import { DrinkArt, ART_ORIGIN } from '../systems/drinkArt.js';
import { PourBar, dialZonesFor, measureOf } from '../systems/pourBar.js';
import { showRecipeCard, showRecipeBook, showComboCard } from '../systems/cards.js';
import { ordersFor, lessonFor, unlockedFeatures, regularOrder, featuresOf } from '../systems/menu.js';
import { perks, gift } from '../systems/shop.js';
import { SHOP_FROM_DAY, GIFTS } from '../data/shop.js';
import { STALL_PROPS, PROP_DEPTH } from '../data/stallProps.js';
import { MACHINE_LESSONS, BOOK } from '../data/recipes.js';
import { MALT } from '../systems/order.js';
import { summarizeDay } from '../systems/daySummary.js';
import { recipeHint, nextStep } from '../systems/hints.js';
import { pickFor, fitScore } from '../systems/assign.js';
import { pickServeTarget } from '../systems/serve.js';
import { createDayState, applyServe, applyTimeout, formatMoney, customersForFame, clampFame } from '../systems/economy.js';
import { weightedPick } from '../systems/random.js';
import { placeArrival, frontCanTake, daySchedule } from '../systems/queue.js';
import { newRun, nextDay, loadRun, saveRun, auntyRating, monthOver, MONTH_DAYS, checkpoint, midDayOf, dayClock } from '../systems/run.js';
import { eventsFor, applyChoice } from '../systems/story.js';
import { EVENTS } from '../data/events.js';
import { startDay, logEvent, finishDay, summarize } from '../systems/playlog.js';
import { Tutorial } from '../systems/tutorial.js';
import { TUTORIAL_STEPS, TOOL_IDS } from '../data/tutorial.js';
import { load, save } from '../systems/save.js';
import { demoSteps, MEASURE, comboFor, demoCup } from '../systems/demo.js';
import { liquidColor } from '../systems/cup.js';
import { hearts, befriend, friendTip, friendPatience, waitLine, WAIT_LINE_AT, MAX_HEARTS } from '../systems/friends.js';
import { playMusic, storyMusic, endStoryMusic } from '../systems/music.js';
import { EPISODE_MUSIC } from '../data/music.js';

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
const SERVE_AREA_Y = COUNTER_Y + 10; // a cup let go above this is "up at the customers"
const FEET_Y = 318; // counter customers stand behind the counter (legs hidden)
const CUP_BOTTOM = 376; // cups sit on the tray plates (the saucer inside the plate's rim)
const CUP_W = 50;
const CUP_H = 62;
// Ah Gong's seat at a table in the background (between counter spots, so nobody hides him); he walks
// in from the street and sits. h = his height up close (he's small, far back). Bubble above him.
const TABLE = { x: 238, feetY: 176, h: 112, bubble: { y: 50, w: 176 } };
// With the Second Table: a walk-in who likes to sit takes the left table, and the two bubbles share the top
// (lean = how far left of the guest the bubble starts, as a share of its width).
const TABLES = [TABLE, { x: 104, feetY: 176, h: 112, bubble: { y: 50, w: 120, lean: 0.8 } }];
const TABLE_PAIR_BUBBLE = { y: 50, w: 154, lean: 0.7 }; // Ah Gong's, when the second table is in use too
const SIT_CHANCE = 0.4; // a walk-in who likes to sit takes the free second table this often
const GROUP_X = [40, 130, 220, 310];
const SINGLE_FILE_MS = 1000; // a group walks up one by one, this far apart, so nobody slides through anybody
const GROUP_XS = { 2: [112, 250], 3: [64, 180, 296], 4: GROUP_X }; // where a group of n stands
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
const PRELUDE_GAP_MS = 2500; // after an episode's opening (Day 1: the note), the stall sits quiet this long before the guest comes
// Day periods on the HUD bar, in minutes from opening (7am): morning, lunch rush, teatime, closing.
// Code-drawn stand-ins for lifted tools whose own art hasn't arrived yet (StallScene methods).
const DRAWN_LIFT = { toolSpoon: function () { return this.drawnSpoon(); }, toolIceScoop: function () { return this.drawnIceScoop(); } };
// The watch-first demo's pace (ms): reading a line, reaching for a tool, carrying it, between steps.
const DEMO = { read: 1100, reach: 650, carry: 950, between: 550 };
const PERIOD_ICONS = ['iconMorning', 'iconLunch', 'iconTeatime', 'iconClosing'];
const PERIODS = [['Morning', 0, 240, 0xffe9a8], ['Lunch', 240, 420, 0xffb870], ['Teatime', 420, 600, 0xbfe0c4], ['Closing', 600, 720, 0x9fb3d9]];
const POUR_DWELL_MS = 140; // a pot only starts pouring once it has stopped over a cup this long...
const POUR_STILL_PX = 12; // ...within this far (sweeping past a cup pours nothing)
const SUMMARY_GRACE_MS = 600; // the day-end card's buttons wake up after this
const CALM_MS = 400; // pop-ups (cards, demos, stories) wait for hands free this long (whenCalm)
const COMBO_CARDS_PER_DAY = 2; // NEW ORDER cards; the rest wait for another day

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
    this.tableGuests = Array(this.perks.tables).fill(null); // sit-down guests by table (Ah Gong's first)
    this.storyDone = new Set(); // 'start' / 'mid' / 'end' already played today
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
    this.friends = { ...(this.run.friends ?? {}) }; // friendship with every kind of customer (systems/friends.js)
    this.lessonsDone = 0;
    this.nextLesson();
    this.paused = false;
    this.dial = null; // the timing dial (Sugar Scoop / Milk Pump / gula), while one is open
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
    this.aiming = null; // a pot held over a cup, not pouring yet (aimPour)
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

    playMusic('day');
    this.tutorial = new Tutorial(this, TUTORIAL_STEPS);
    if (data?.morning) this.openShutter();
    // Day 1, first time: Episode 1 first (Aunty Lim walks in and says hello), then the tutorial
    this.pendingTutorial = this.day === 1 && !load('tutorialDone', false);
    this.stallLock = null;
    this.coachNote = null;
    this.comboQueue = [];
    this.combosToday = 0;
    this.popups = []; // cards / demos / stories waiting for a calm moment (whenCalm)
    this.calmMs = 0;
    this.midQueued = false;
    this.tutorialStarting = false;
    this.queueShown = 0;
    this.queueChip = null;
    if (this.pendingTutorial) this.lockStall(true);
    this.resumeMidDay(midDayOf(this.run));
    // closing the page (or switching away) keeps today so far
    const keep = () => document.visibilityState === 'hidden' && this.checkpoint();
    const bye = () => this.checkpoint();
    document.addEventListener('visibilitychange', keep);
    window.addEventListener('pagehide', bye);
    this.events.once('shutdown', () => (document.removeEventListener('visibilitychange', keep), window.removeEventListener('pagehide', bye)));
    this.time.delayedCall(data?.morning ? 1900 : 500, () => this.whenCalm(() => this.playStory('start')));

    if (import.meta.env.DEV) window.__stall = this;
  }

  // Save today so far on the run (systems/run.js midDay): clock, money, stories, lessons, friends.
  // Not during the Day-1 tutorial, and not once the day has ended (the night saves tomorrow).
  checkpoint() {
    if (this.ended || this.pendingTutorial || this.tutorial?.active) return;
    const owed = this.guestEpisode;
    saveRun(checkpoint(this.run, {
      clockMs: Math.round(this.clockMs),
      econ: { ...this.econ },
      flags: [...this.flags],
      friends: { ...this.friends },
      storyDone: [...this.storyDone],
      cameToday: [...this.cameToday],
      lessonsDone: this.lessonsDone,
      guestOwed: owed ? { id: owed.id, noTitle: !!owed.noTitle } : null,
      ending: this.ending,
      log: this.log,
    }));
  }

  // Back after closing the page mid-day: carry on from the saved clock. The customers and cups that
  // were at the stall have gone; regulars who hadn't come yet still come.
  resumeMidDay(m) {
    if (!m) return;
    this.clockMs = m.clockMs;
    Object.assign(this.econ, m.econ);
    this.flags = [...m.flags];
    this.friends = { ...m.friends };
    m.storyDone.forEach((k) => this.storyDone.add(k));
    m.cameToday.forEach((id) => this.cameToday.add(id));
    for (let i = 0; i < m.lessonsDone; i++) this.nextLesson();
    this.lessonsDone = m.lessonsDone;
    this.ending = m.ending ?? null;
    if (m.log) this.log = m.log;
    let late = 0;
    this.arrivals = this.arrivals
      .filter((a) => a.at > this.clockMs || (a.id && !this.cameToday.has(a.id)))
      .map((a) => (a.at > this.clockMs ? a : { ...a, at: this.clockMs + 2500 + 3000 * late++ }))
      .sort((a, b) => a.at - b.at);
    const ep = m.guestOwed && EVENTS.find((e) => e.id === m.guestOwed.id);
    if (ep) this.time.delayedCall(1500, () => this.bringGuest({ ...ep, noTitle: m.guestOwed.noTitle }));
    const back = UI.welcomeBack.replace('{time}', dayClock(this.clockMs));
    this.time.delayedCall(900, () => this.setFeedback(back));
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
    // the recipe book tab, top right: pauses the stall and opens Uncle Tan's book
    const tab = this.add.rectangle(GAME_W - 4, HUD_H, 92, 26, 0xfff3d6).setOrigin(1, 0).setStrokeStyle(2, COLORS.inkHex).setDepth(46);
    const icon = addSprite(this, 'iconBook', GAME_W - 80, HUD_H + 24, 20).setDepth(47);
    const label = addText(this, GAME_W - 52, HUD_H + 13, 'Recipes', { size: 12, bold: true, origin: 0.5 }).setDepth(47);
    for (const o of [tab, icon, label]) o.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.openRecipeBook());
    addMuteToggle(this, GAME_W - 26, HUD_H + 30, { size: 11 }).setDepth(45);
    this.pourBar = new PourBar(this, POUR_BAR_Y);
    this.refreshHud();
  }

  drawTray() {
    const four = this.perks.plates >= 4;
    if (four) this.drawFourPlates();
    this.slots = (four ? SLOT_X4 : SLOT_X).map((x, i) => {
      const label = addText(this, x, CUP_BOTTOM + 6, '', { size: 10, bold: true, align: 'center', origin: [0.5, 0], color: '#fff6dc', wrap: four ? 86 : 112 }).setDepth(16);
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

  // Fourth Tray Plate: a 4-plate steel tray laid over the background's three (drawn in code until its art).
  drawFourPlates() {
    const g = this.add.graphics().setDepth(11); // over the background's front layer (depth 10)
    const top = 322;
    const bottom = 396;
    g.fillStyle(0xbf5e21, 1).fillRect(6, top, GAME_W - 12, bottom - top);
    g.fillStyle(0x9c4a1a, 1).fillRect(6, top, GAME_W - 12, 4).fillRect(6, bottom - 5, GAME_W - 12, 5);
    for (const x of SLOT_X4) {
      g.fillStyle(0x2b2420, 0.35).fillRoundedRect(x - 41, top + 8, 84, 64, 7); // soft shadow
      g.fillStyle(0xc9ced4, 1).fillRoundedRect(x - 42, top + 5, 84, 64, 7);
      g.fillStyle(0x4a3d36, 1).fillRoundedRect(x - 37, top + 10, 74, 54, 5);
      g.fillStyle(0xffffff, 0.12).fillRect(x - 33, top + 13, 66, 6);
      g.lineStyle(2, 0x2b2420, 0.9).strokeRoundedRect(x - 42, top + 5, 84, 64, 7);
    }
  }

  drawTools() {
    this.tools = {};
    const extra = (this.run.owned ?? []).map((id) => MACHINE_TOOLS[id]).filter(Boolean);
    // counter machines fill the counter between the tip jar / bell (left end) and the fan (right end)
    const owns = (id) => this.run.owned?.includes(id);
    const rail = { ...layoutRail([...TOOLS, ...extra]), ...layoutCounter(extra, owns('tipJar') || owns('bell') ? 58 : 6, owns('fan') ? 322 : 354) };
    for (const def of [...TOOLS, ...extra]) {
      const spot = rail[def.id];
      const t = spot ? { ...def, x: spot.x, w: def.w * spot.scale } : def;
      // counter-top machines stand behind the cups, so a tall Godzilla or a tapau knot stays in view
      const c = this.add.container(t.x, t.y).setDepth(t.feet === COUNTER ? 12 : 20);
      c.homeDepth = c.depth;
      c.homeScale = spot?.scale ?? 1;
      c.setScale(c.homeScale);
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

  // Shape for tools without art yet: the counter machines (t.shape), the tarik mugs, a tin for pouring
  // tools (Horlicks), else the bin.
  drawToolShape(g, t) {
    const w = t.w - 10;
    const h = t.h - 18;
    const top = -t.h / 2 + 2;
    if (t.shape) return this.drawCounterShape(g, t, w, h, top);
    if (t.kind === 'tarik') {
      const mug = (x, y, mw, mh) => {
        g.fillStyle(0x3a2e2a, 1).fillRoundedRect(x - 2, y - 2, mw + 4, mh + 4, 5);
        g.fillStyle(t.color, 1).fillRoundedRect(x, y, mw, mh, 4);
        g.fillStyle(0xeef1f4, 1).fillRect(x + 3, y + 3, 3, mh - 8);
        g.lineStyle(3, 0x3a2e2a, 1).strokeCircle(x + mw + 4, y + mh / 2, 5);
      };
      mug(-w / 2, top + 16, w * 0.55, h - 14);
      mug(-w / 2 + w * 0.42, top + 4, w * 0.5, h - 18);
      return;
    }
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

  // The counter-top machines, drawn in code until their art (docs/art/PROMPTS_2026-10.md part 5), with a
  // thick dark outline like the sprites.
  drawCounterShape(g, t, w, h, top) {
    const ink = 0x3a2e2a;
    const bot = top + h + 4; // just above the name tag
    const out = (fn) => (g.lineStyle(2, ink, 1), fn());
    if (t.shape === 'bottle') {
      // gula melaka: a dark syrup bottle with a cork
      g.fillStyle(t.color, 1).fillRoundedRect(-w / 2 + 3, top + 12, w - 6, bot - top - 12, 6);
      g.fillRect(-5, top + 2, 10, 12);
      g.fillStyle(0xc89a5a, 1).fillRect(-4, top - 2, 8, 6);
      g.fillStyle(0xf2d9a6, 1).fillRect(-w / 2 + 6, top + 20, w - 12, 9); // plain label
      g.fillStyle(0xffffff, 0.25).fillRect(-w / 2 + 6, top + 32, 3, bot - top - 36);
      out(() => g.strokeRoundedRect(-w / 2 + 3, top + 12, w - 6, bot - top - 12, 6).strokeRect(-5, top + 2, 10, 12));
    } else if (t.shape === 'pot') {
      // halia: a small clay pot with ginger slices peeking out
      g.fillStyle(0xf0d27a, 1).fillCircle(-6, top + 12, 6).fillCircle(5, top + 10, 5);
      g.fillStyle(0xa0522d, 1).fillRoundedRect(-w / 2, top + 14, w, bot - top - 14, 9);
      g.fillStyle(0x8a4322, 1).fillRect(-w / 2 - 2, top + 13, w + 4, 6);
      out(() => g.strokeRoundedRect(-w / 2, top + 14, w, bot - top - 14, 9).strokeCircle(-6, top + 12, 6));
    } else if (t.shape === 'bowl') {
      // limau: a bowl of calamansi
      for (const [dx, dy] of [[-9, 6], [0, 2], [9, 6], [-4, 9], [5, 10]]) {
        g.fillStyle(t.color, 1).fillCircle(dx, top + 14 + dy, 6).lineStyle(1.5, ink, 1).strokeCircle(dx, top + 14 + dy, 6);
        g.fillStyle(0xf2a33a, 1).fillCircle(dx - 1, top + 13 + dy, 2);
      }
      g.fillStyle(0xe8edf0, 1).fillRoundedRect(-w / 2, top + 20, w, bot - top - 20, { tl: 2, tr: 2, bl: 12, br: 12 });
      out(() => g.strokeRoundedRect(-w / 2, top + 20, w, bot - top - 20, { tl: 2, tr: 2, bl: 12, br: 12 }));
    } else if (t.shape === 'dish') {
      // butter: a block of butter on a small saucer
      g.fillStyle(0xffffff, 1).fillEllipse(0, bot - 5, w + 6, 12);
      g.fillStyle(t.color, 1).fillRoundedRect(-w / 2 + 6, top + 12, w - 12, bot - top - 18, 3);
      g.fillStyle(0xfff3b0, 1).fillRect(-w / 2 + 8, top + 14, w - 16, 4);
      out(() => g.strokeEllipse(0, bot - 5, w + 6, 12).strokeRoundedRect(-w / 2 + 6, top + 12, w - 12, bot - top - 18, 3));
    } else if (t.shape === 'tub') {
      // ice cream: a little white chest freezer with a cone of vanilla on its lid
      g.fillStyle(0xe8f1f5, 1).fillRoundedRect(-w / 2, top + 14, w, bot - top - 14, 5);
      g.fillStyle(0x9fc6d8, 1).fillRect(-w / 2 + 4, top + 22, w - 8, 3);
      g.fillStyle(0xfff4dc, 1).fillCircle(0, top + 6, 8);
      g.fillStyle(0xd9a066, 1).fillTriangle(-6, top + 10, 6, top + 10, 0, top + 18);
      out(() => g.strokeRoundedRect(-w / 2, top + 14, w, bot - top - 14, 5).strokeCircle(0, top + 6, 8));
    } else if (t.shape === 'bag') {
      // tapau: a stack of clear plastic bags with red strings
      g.lineStyle(2.5, 0xd8322a, 1).strokeEllipse(-4, top + 8, 14, 12).strokeEllipse(5, top + 6, 14, 12);
      g.fillStyle(t.color, 0.95).fillRoundedRect(-w / 2 + 2, top + 12, w - 4, bot - top - 12, 6);
      g.fillStyle(0xffffff, 0.7).fillRect(-w / 2 + 6, top + 16, 3, bot - top - 22);
      out(() => g.strokeRoundedRect(-w / 2 + 2, top + 12, w - 4, bot - top - 12, 6));
    }
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

  // A short line in your own thought bubble for `ms` (tutorial tips), then the usual hints again.
  think(text, ms = 4000) {
    this.coachNote = { text, until: this.time.now + ms };
    this.setCoach(text);
  }

  // Day 1, before a customer hands you the turn: tools and cups can't be touched (an invisible
  // cover over the stall; the HUD and the recipe book stay usable).
  lockStall(on) {
    if (on && !this.stallLock) this.stallLock = this.add.rectangle(0, HUD_H + 30, GAME_W, GAME_H - HUD_H - 30, 0x000000, 0.001).setOrigin(0).setDepth(57).setInteractive();
    if (!on && this.stallLock) {
      this.stallLock.destroy();
      this.stallLock = null;
    }
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
    if (this.demo) return this.setCoach(this.demo.say);
    if (this.coachNote && this.time.now < this.coachNote.until) return this.setCoach(this.coachNote.text);
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
    const half = this.slots.length > 3 ? 44 : 52;
    return this.slots.find((s) => Math.abs(x - s.x) < half && y > CUP_BOTTOM - CUP_H - 46 && y < CUP_BOTTOM + 18);
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
    this.highlightCustomer(this.serveTarget(slot, p.worldX, p.worldY));
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
    const c = this.serveTarget(slot, p.worldX, p.worldY);
    if (c) {
      this.serveCup(slot, c);
      slot.container.setPosition(slot.x, CUP_BOTTOM).setDepth(14);
      return;
    }
    if (p.worldY < SERVE_AREA_Y && this.waitingCustomers().length) this.setFeedback(UI.missedServe);
    back();
  }

  // Who this cup goes to if let go here (systems/serve.js): its own customer first.
  serveTarget(slot, x, y) {
    const ticket = slot.ticket?.c?.state === 'waiting' ? slot.ticket.c : null;
    const zones = this.waitingCustomers().map((c) => this.dropZone(c));
    return pickServeTarget({ zones, ticket, point: { x, y }, inArea: y < SERVE_AREA_Y });
  }

  // One generous drop zone per customer: every member's sprite and the bubble, gaps included.
  dropZone(c) {
    const rects = [...c.sprites.map((s) => s.getBounds()), c.bubble?.frame.getBounds()].filter(Boolean);
    const r = rects.reduce((a, b) => Phaser.Geom.Rectangle.Union(a, b, a), Phaser.Geom.Rectangle.Clone(rects[0]));
    Phaser.Geom.Rectangle.Inflate(r, 10, 10);
    const body = c.sprites.reduce((a, s) => a + s.x, 0) / c.sprites.length;
    return { c, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, cx: body, cy: c.sprites[0].y - c.sprites[0].displayHeight / 2 };
  }

  // ---------- tools ----------

  onToolDragStart(tool) {
    this.dragging += 1;
    play('pickup');
    this.liftTool(tool, true);
    tool.setDepth(46);
    this.tweens.add({ targets: tool, scale: 1.08, duration: 80 }); // full size in the hand
    tool.lastStirDir = 0;
    tool.lastX = null;
    tool.lastPullDir = 0;
    tool.lastY = null;
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
      this.aimPour(tool, target, p);
    } else if (t.kind === 'tarik' && target?.cup.base) {
      const y = p.worldY;
      if (tool.lastY != null && Math.abs(y - tool.lastY) > 14) {
        const dir = Math.sign(y - tool.lastY);
        if (tool.lastPullDir && dir !== tool.lastPullDir) this.tarikCup(target);
        tool.lastPullDir = dir;
        tool.lastY = y;
      } else if (tool.lastY == null) tool.lastY = y;
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

  // A pot held over a cup becomes "aimed"; update() starts the pour once it has been still there a
  // moment (POUR_DWELL_MS). Once pouring it keeps going over that cup; another cup starts over.
  aimPour(tool, target, p) {
    if (this.pouring?.tool === tool && this.pouring.slot === target) return;
    if (this.pouring?.tool === tool) {
      this.pouring = null;
      this.poseTool(tool, false);
    }
    const a = tool.aim;
    if (!target) tool.aim = null;
    else if (a?.slot !== target || Math.hypot(p.worldX - a.x, p.worldY - a.y) > POUR_STILL_PX) tool.aim = { slot: target, x: p.worldX, y: p.worldY, ms: 0 };
    this.aiming = tool.aim ? tool : null;
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
    // the counter machines stand right above the cups: a tap, or letting go back at its own spot, adds nothing
    const atHome = Math.hypot(p.worldX - tool.home.x, p.worldY - LIFT - tool.home.y) < 6;
    const tapped = t.feet === COUNTER && ((p.getDistance && p.getDistance() < 8) || atHome);
    const slot = tapped ? null : this.slotAt(p.worldX, p.worldY - LIFT + t.h / 2);
    if (t.kind === 'drop' && slot?.cup) this.dropOnCup(slot, t.apply);
    if (t.kind === 'pour' && this.dosed(t) && slot?.cup) this.openDial(slot, t.ingredient);
    if (t.kind === 'stir' && slot?.cup?.base) this.autoStir(slot); // drop the spoon on a cup: it stirs itself
    if (t.kind === 'tarik' && slot?.cup?.base) this.autoTarik(slot); // drop the mugs on a cup: it's pulled
    if (t.kind === 'rack' && slot && !slot.cup) this.placeCup(slot);
    this.pouring = null;
    this.aiming = null;
    tool.aim = null;
    this.poseTool(tool, false);
    this.liftTool(tool, false);
    tool.setAngle(0);
    // While it glides home it passes BEHIND the cups (depth 14), so a quick tap on a cup still
    // grabs the cup, but the tool itself can be grabbed again straight away.
    tool.setDepth(13);
    this.tweens.add({ targets: tool, x: tool.home.x, y: tool.home.y, scale: tool.homeScale ?? 1, duration: 160, ease: 'Quad.out', onComplete: () => tool.setDepth(tool.homeDepth ?? 20) });
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
    else if (what === 'powder') addPowder(slot.cup);
    else addExtra(slot.cup, what); // halia, limau, butter, ice cream (scoop), the tapau bag
    play({ ice: 'ice', powder: 'ice', scoop: 'ice', tapau: 'tap' }[what] ?? 'sugar');
    this.recheckCup(slot);
  }

  // Sugar Scoop / Milk Pump (night shop) and the gula melaka bottle: drop on a cup, then the timing dial.
  // (The gula bottle always does: it stands on the counter right above the cups, so it can't pour while carried.)
  dosed(t) {
    return t.ingredient === 'gula' || (t.ingredient === 'sugar' && this.perks.sugarScoop) || (['condensed', 'evap'].includes(t.ingredient) && this.perks.milkPump);
  }

  // The timing dial (systems/dial.js): a needle sweeps the pour bar's zones; one tap anywhere stops it and the
  // cup gets the middle of that zone. autoStop = a value the demo's hand stops on (the zone it lies in).
  openDial(slot, ingredient, autoStop = null) {
    if (this.dial || !slot?.cup) return;
    this.focusSlot = slot;
    const zones = dialZonesFor(ingredient);
    // a tap anywhere stops it (an invisible sheet over the stall, under the HUD and the bar)
    const catcher = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0.001).setOrigin(0).setDepth(54).setInteractive();
    catcher.on('pointerdown', () => !autoStop && this.stopDial());
    const tap = addText(this, slot.x, CUP_BOTTOM - CUP_H - 18, 'TAP!', { size: 18, bold: true, color: '#fff6dc', origin: 0.5 }).setDepth(56);
    tap.setStroke('#c8562e', 5);
    this.tweens.add({ targets: tap, scale: 1.15, duration: 280, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.dial = { slot, ingredient, zones, ms: 0, value: 0, max: zones.at(-1)[2], autoStop, parts: [catcher, tap] };
    play('tap');
  }

  updateDial(delta) {
    const d = this.dial;
    if (!d.slot.cup) return this.closeDial(); // served or binned meanwhile
    d.ms += delta;
    d.value = needleAt(d.ms, d.max, TUNING.dialSweepMs);
    this.pourBar.show(d.ingredient, d.slot.cup, d.slot.i + 1, d.slot.ticket, { value: d.value });
    if (d.autoStop != null && zoneAt(d.zones, d.value) === zoneAt(d.zones, d.autoStop) && d.ms > 500) this.stopDial();
  }

  stopDial() {
    const d = this.dial;
    if (!d) return;
    const add = doseFor(d.zones, d.value, measureOf(d.ingredient, d.slot.cup));
    if (add > 0) {
      pour(d.slot.cup, d.ingredient, (add * 1000) / TUNING.pourPerSec[d.ingredient]);
      for (let i = 0; i < 8; i++) d.slot.art.update(d.slot.cup, 16, { ingredient: d.ingredient }); // a little shower of it
      play(d.ingredient === 'sugar' ? 'sugar' : 'milk');
    }
    this.recheckCup(d.slot);
    this.pourBar.show(d.ingredient, d.slot.cup, d.slot.i + 1, d.slot.ticket); // where it landed
    this.closeDial();
  }

  closeDial() {
    this.dial?.parts.forEach((o) => (this.tweens.killTweensOf(o), o.destroy()));
    this.dial = null;
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

  // Teh tarik: a steel mug above the cup pours a long stream down and pulls back up, a few times.
  autoTarik(slot) {
    if (slot.pulling) return;
    slot.pulling = true;
    this.focusSlot = slot;
    const ms = TUNING.autoTarikMs;
    const g = this.add.graphics().setDepth(16);
    const cx = slot.x + 6;
    const rim = CUP_BOTTOM - CUP_H + 4;
    const p = { k: 0 };
    this.tweens.add({
      targets: p, k: 1, duration: ms,
      onUpdate: () => {
        const h = 40 + 60 * Math.abs(Math.sin(p.k * Math.PI * TUNING.tarikPullsNeeded)); // up high, down low
        const top = rim - h;
        g.clear();
        g.lineStyle(5, 0xc8905a, 0.9).lineBetween(cx, top + 14, cx, rim); // the stream of teh
        g.fillStyle(0x3a2e2a, 1).fillRoundedRect(cx - 14, top - 18, 28, 30, 6); // the mug (outline)
        g.fillStyle(0xc9ced4, 1).fillRoundedRect(cx - 12, top - 16, 24, 26, 5);
        g.fillStyle(0xeef1f4, 1).fillRect(cx - 9, top - 13, 4, 18);
        g.lineStyle(3, 0x3a2e2a, 1).strokeCircle(cx + 15, top - 3, 6);
      },
      onComplete: () => g.destroy(),
    });
    for (let i = 1; i <= TUNING.tarikPullsNeeded; i++) {
      this.time.delayedCall((ms / TUNING.tarikPullsNeeded) * i, () => slot.cup && slot.cup.froth < 1 && this.tarikCup(slot));
    }
    this.time.delayedCall(ms, () => (slot.pulling = false));
  }

  tarikCup(slot) {
    tarikStep(slot.cup);
    play('pour');
    this.redrawSlot(slot);
  }

  stirCup(slot) {
    stirStep(slot.cup);
    play('stir');
    this.redrawSlot(slot);
    this.tweens.add({ targets: slot.container, angle: { from: -3, to: 3 }, duration: 60, yoyo: true, onComplete: () => slot.container.setAngle(0) });
  }

  // ---------- "watch first": a ghost hand makes an order with the real tools ----------

  // Plays systems/demo.js steps for customer c. onDone(made) runs after (made = the cup is ready).
  async runDemo(c, onDone = () => {}) {
    if (this.demo || this.ended || load('demosOff', false)) return onDone(false);
    const demo = (this.demo = { c, say: '', cancelled: false, tool: null });
    const wasTutorial = c.tutorial;
    c.tutorial = true; // their patience waits while we watch
    const depth = 58;
    const block = this.add.rectangle(0, HUD_H, GAME_W, GAME_H - HUD_H, 0x000000, 0.001).setOrigin(0).setDepth(depth).setInteractive();
    // Skip buttons sit at the end of the thought-bubble row, clear of the customers' bubbles
    const skip = makeButton(this, GAME_W - 132, COACH_Y + 26, 60, 22, 'Skip ▸', () => (demo.cancelled = true), { size: 10, bold: true, fill: 0xbfe3c0 });
    const skipAll = makeButton(this, GAME_W - 68, COACH_Y + 26, 62, 22, 'Skip all', () => (save('demosOff', true), (demo.cancelled = true)), { size: 10 });
    // the ghost hand: the fingertip sits on the point it's "touching"
    const hand = addText(this, GAME_W / 2, GAME_H, '👆', { size: 34, origin: [0.32, 0.05] }).setDepth(depth + 1).setAlpha(0);
    const objs = [block, skip.bg, skip.txt, skipAll.bg, skipAll.txt, hand];
    [skip.bg, skipAll.bg].forEach((o) => o.setDepth(depth + 2));
    [skip.txt, skipAll.txt].forEach((o) => o.setDepth(depth + 3));
    this.tweens.add({ targets: hand, alpha: 0.95, duration: 250 });

    const wait = (ms) => new Promise((r) => this.time.delayedCall(ms, r));
    const until = async (done, ms = 12000) => {
      for (let t = 0; t < ms && !done() && !demo.cancelled && !this.ended; t += 40) await wait(40);
    };
    const glide = (from, to, ms, each) => new Promise((r) => {
      const p = { x: from.x, y: from.y };
      this.tweens.add({ targets: p, x: to.x, y: to.y, duration: ms, ease: 'Sine.inOut', onUpdate: () => each(p), onComplete: r });
    });
    const touch = (p) => hand.setPosition(p.x, p.y);
    let slot = null;
    let made = false;
    const steps = demoSteps(c.spec);
    for (const [i, s] of steps.entries()) {
      if (demo.cancelled || this.ended) break;
      demo.say = `Watch ${c.def.short ?? c.def.name} teach · ${i + 1}/${steps.length}`;
      if (s.do !== 'serve') {
        this.showBubble(c, s.teach, 'say');
        await wait(DEMO.read); // time to read what they say before the hand moves
      }
      if (s.do === 'serve') {
        made = true;
        this.showBubble(c, s.teach, 'say');
        play('cheer');
        this.happyHop(c);
        demo.say = `Your turn! Drag the cup to ${c.def.short ?? c.def.name}`;
        await glide(hand, { x: slot.x, y: CUP_BOTTOM - 30 }, 400, touch);
        await glide(hand, { x: this.centerX(c), y: FEET_Y - 70 }, 700, touch);
        await wait(700);
        break;
      }
      const tool = this.tools[{ cup: 'rack', stir: 'stir', tarik: 'tarik', ice: 'ice', powder: 'powder' }[s.do] ?? s.tool];
      const target = slot ?? this.freeSlot();
      if (!tool || !target) break; // e.g. a tool the stall doesn't own
      // the hand reaches for the tool, picks it up and carries it over the cup
      const home = { x: tool.home.x, y: tool.home.y + LIFT };
      const over = { x: target.x + (s.do === 'pour' ? 14 : 0), y: CUP_BOTTOM - CUP_H - 4 + LIFT - tool.tool.h / 2 };
      await glide(hand, home, DEMO.reach, touch);
      if (demo.cancelled) break;
      demo.tool = tool;
      this.onToolDragStart(tool);
      await glide(home, over, DEMO.carry, (p) => (touch(p), this.onToolDrag(tool, { worldX: p.x, worldY: p.y })));
      if (s.do === 'pour') {
        if (this.dosed(tool.tool)) {
          // scoop / pump / gula: drop it on, and the dial stops on the target zone by itself
          this.openDial(target, tool.tool.ingredient, s.until);
          await until(() => !this.dial);
        } else {
          demo.stop = { measure: s.measure, until: s.until };
          await until(() => MEASURE[s.measure](target.cup) >= s.until);
          demo.stop = null;
        }
        this.onToolDragEnd(tool, { worldX: home.x, worldY: home.y }); // let go away from the cup
      } else {
        this.onToolDragEnd(tool, { worldX: over.x, worldY: over.y }); // drop it on the cup (or the rack's cup on the tray)
        if (s.do === 'cup') slot = target;
        await wait(s.do === 'stir' ? (this.perks.stirMs ?? TUNING.autoStirMs) + 250 : s.do === 'tarik' ? TUNING.autoTarikMs + 250 : 450);
      }
      demo.tool = null;
      await wait(DEMO.between);
    }
    if (demo.tool) this.onToolDragEnd(demo.tool, { worldX: demo.tool.home.x, worldY: demo.tool.home.y + LIFT });
    this.tweens.add({ targets: objs, alpha: 0, duration: 200, onComplete: () => objs.forEach((o) => o.destroy()) });
    c.tutorial = wasTutorial;
    this.demo = null;
    // a moment to read "pass me the cup", then their order bubble (and patience) comes back
    this.time.delayedCall(made ? 2500 : 0, () => c.state === 'waiting' && !c.served && this.showBubble(c, c.orderLine, 'order'));
    onDone(made && !demo.cancelled);
  }

  // ---------- the first time an order comes up: its combination card ----------

  newOrderCheck(c) {
    const seen = load('combosSeen', []);
    if (seen.includes(c.orderText) || this.comboQueue.some((q) => q.orderText === c.orderText) || this.taughtAlready(c.spec)) return;
    this.comboQueue.push(c);
  }

  // One teaching moment per drink: no NEW ORDER card when every recipe word in it was already taught
  // (a lesson or another card), or when a lesson still coming today teaches it.
  taughtAlready(spec) {
    const f = featuresOf(spec);
    const known = load('featuresSeen', []);
    const coming = [this.lessonState === 'done' ? null : this.lesson, ...this.lessons].filter(Boolean).flatMap((l) => l.features);
    return f.some((x) => coming.includes(x)) || f.every((x) => known.includes(x));
  }

  markTaught(orderText, features) {
    save('combosSeen', [...new Set([...load('combosSeen', []), orderText])]);
    save('featuresSeen', [...new Set([...load('featuresSeen', []), ...features])]);
  }

  // Called every frame: show a waiting combination card when nothing else is on screen.
  showNextCombo() {
    if (!this.comboQueue.length || this.popups.length || !this.calm() || this.calmMs < CALM_MS) return;
    const c = this.comboQueue.shift();
    if (load('combosSeen', []).includes(c.orderText) || this.taughtAlready(c.spec)) return;
    if (this.combosToday >= COMBO_CARDS_PER_DAY) return; // stays unseen: it can come up another day
    this.combosToday += 1;
    this.markTaught(c.orderText, featuresOf(c.spec));
    const items = this.comboItems(c.spec);
    // what the new words mean (the recipe book's lines), skipping the plain bases
    const notes = featuresOf(c.spec).filter((f) => !['kopi', 'teh', 'milo', 'horlicks'].includes(f) && BOOK[f]).map((f) => `${BOOK[f].name}: ${BOOK[f].text}`);
    this.pauseFor((resume) => showComboCard(this, { name: c.orderText, items, cupTint: liquidColor(demoCup(c.spec)), notes, onClose: resume }));
  }

  // An order's combination as pictures, [{ key, tint, zone }] (new-order cards, recipe cards, the recipe book).
  comboItems(spec) {
    return comboFor(spec).map(({ tool, zone }) => {
      if (tool === 'powder') return { key: spec.base === 'horlicks' ? 'toolHorlicks' : 'toolMilo', zone };
      return { ...this.toolIcon(tool), zone };
    });
  }

  // The picture of a stall tool by id: its art, or (tarik mugs, counter machines) its code-drawn shape
  // rendered once at 3x into a texture so it stays sharp on the cards.
  toolIcon(id) {
    const def = [...TOOLS, ...Object.values(MACHINE_TOOLS)].find((t) => t.id === id);
    if (!def) return { key: 'cupGlass' };
    if (def.sprite) return { key: def.sprite, tint: def.tint };
    const key = `toolIcon_${id}`;
    if (!this.textures.exists(key)) {
      const S = 3;
      const g = this.make.graphics({}, false);
      this.drawToolShape(g, def);
      g.setScale(S);
      const rt = this.make.renderTexture({ width: def.w * S, height: def.h * S }, false);
      rt.draw(g, (def.w * S) / 2, (def.h * S) / 2);
      rt.saveTexture(key);
      g.destroy();
    }
    return { key };
  }

  // ---------- customers ----------

  waitingCustomers() {
    return [...new Set([...this.spots, ...this.tableGuests])].filter((c) => c?.state === 'waiting');
  }

  allCustomers() {
    return [...new Set([...this.spots, ...this.tableGuests])].filter(Boolean);
  }

  freeSpots() {
    return this.spots.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  }

  // Where this customer would go right now: 'table', 'counter', 'queue' or null (no room).
  placeFor(def) {
    if (def.slot === 'table') return this.tableGuests[0] ? null : 'table';
    const group = def.groupSize > 1 && !def.bulk; // a bulk rider takes one spot
    const place = placeArrival({ freeSpots: this.freeSpots().length, totalSpots: this.spots.length, lineLength: this.queue.length, max: this.queueMax, group });
    return place ?? (def.sits && this.tableGuests[1] === null ? 'table' : null); // no room at the counter: the second table
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

    let place = this.placeFor(def);
    const seat = def.slot === 'table' ? 0 : 1;
    if (def.sits && this.tableGuests[1] === null && Math.random() < SIT_CHANCE) place = 'table'; // Second Table, sometimes by choice
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
      hearts: hearts(this.friends[def.id]),
      patienceMax: 0,
      patienceMs: 0,
      bubble: null,
      whole: n > 1 && !def.bulk, // needs the whole counter (a group); a bulk rider is one person with n cups
    };
    c.patienceMax = c.patienceMs = def.patience * 1000 * TUNING.patienceScale * this.perks.patienceMult * friendPatience(c.hearts);
    c.orderLine = pickLine(def.lines, 'order', this.lineVars({ order: orderText, n, plain: plainOrder(c.spec) }));

    if (place === 'table') {
      c.spot = 'table';
      c.table = seat;
      this.tableGuests[seat] = c;
      const t = TABLES[seat];
      // def.sprite is drawn sitting (Ah Gong): he walks in on def.walkSprite and sits down at the table, or,
      // until that art exists, simply appears in his seat (a sitting picture can't walk)
      const walkKey = def.seated ? (this.textures.exists(def.walkSprite ?? '') ? def.walkSprite : null) : def.sprite;
      if (!walkKey) {
        const s = addSprite(this, def.sprite, t.x, t.feetY, t.h).setDepth(1.8).setAlpha(0);
        s.setScale(s.baseScale * this.scaleAt(s.y));
        c.sprites = [s];
        this.tweens.add({ targets: s, alpha: 1, duration: 600, ease: 'Sine.out', onComplete: () => this.arrive(c) });
        return c;
      }
      // the standing art keeps its size relative to the sitting one (spriteSizes.json)
      const walkH = walkKey === def.sprite ? t.h : (t.h * displayHeight(walkKey)) / displayHeight(def.sprite);
      const s = addSprite(this, walkKey, ENTRY.x, ENTRY.feetY, walkH).setDepth(1.8); // behind counter customers
      s.setScale(s.baseScale * this.scaleAt(s.y));
      c.sprites = [s];
      this.walk(s, t.x, t.feetY, 0, () => {
        if (walkKey !== def.sprite) {
          // sits down: swap to the sitting picture at the table's size
          s.setTexture(def.sprite);
          s.homeKey = def.sprite;
          s.baseScale = t.h / s.height;
          s.setScale(s.baseScale * this.scaleAt(s.y));
        }
        this.arrive(c);
      });
      return c;
    }
    const keys = c.whole ? (def.sprites ?? Array(n).fill(def.sprite)).slice(0, n) : [def.sprite];
    c.sprites = keys.map((key, i) => {
      const s = addSprite(this, key, ENTRY.x - i * 18, ENTRY.feetY - (i % 2) * 3);
      s.ySort = true; // drawn by distance: whoever stands nearer is on top (see walk)
      this.sortByFeet(s, s.y);
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
    c.spot = c.whole ? 'all' : Phaser.Utils.Array.GetRandom(this.freeSpots());
    if (c.whole) this.spots = this.spots.map(() => c);
    else this.spots[c.spot] = c;
    c.state = 'walking';
    const xs = c.whole ? GROUP_XS[c.n] : [SPOT_X[c.spot]];
    // single file: whoever goes furthest leads, the rest follow at the same steady pace
    const order = xs.map((x, i) => i).sort((a, b) => xs[b] - xs[a]);
    let walking = c.sprites.length;
    c.sprites.forEach((s, i) => {
      const rank = order.indexOf(i);
      s.depthBias = 0;
      this.walk(s, xs[i], FEET_Y - (i % 2) * 4, rank * SINGLE_FILE_MS, () => --walking === 0 && this.arrive(c), c.whole ? 'Linear' : 'Sine.inOut');
    });
  }

  walkToQueue(c, idx) {
    const p = QUEUE_POS[Math.min(idx, QUEUE_POS.length - 1)];
    c.sprites.forEach((s, i) => {
      s.depthBias = -idx * 0.0002; // past the third spot the line shares a spot: the one in front still wins
      this.walk(s, p.x - i * 14, p.feetY - (i % 2) * 3, i * 120);
    });
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
  // Customers are drawn by distance: nearer (bigger feet y) on top. Table guests keep their own depth.
  sortByFeet(s, feetY) {
    if (s.ySort) s.setDepth(2 + feetY / 1000 + (s.depthBias ?? 0));
  }

  walk(s, x, y, delay = 0, done = null, ease = 'Sine.inOut') {
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
      targets: p, t: 1, duration, delay, ease,
      onUpdate: () => {
        const gy = Phaser.Math.Linear(from.y, y, p.t);
        const phase = p.t * steps * Math.PI;
        s.bob = frames ? 0 : Math.abs(Math.sin(phase)) * 4;
        s.setPosition(Phaser.Math.Linear(from.x, x, p.t), gy - s.bob);
        s.setAngle(frames ? 0 : Math.sin(phase) * 4);
        s.setScale(s.baseScale * this.scaleAt(gy));
        this.sortByFeet(s, gy);
      },
      onComplete: () => {
        s.bob = 0;
        s.walkTween = null;
        s.setPosition(x, y).setAngle(0).setScale(s.baseScale * this.scaleAt(y));
        this.sortByFeet(s, y);
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
    if (c.lesson) this.whenCalm(() => this.showLesson(c.lessonLine));
    if (c.onArrive) this.time.delayedCall(700, () => c.onArrive()); // e.g. the tutorial's next step
    if (!c.tutorial && !c.lesson && !c.onArrive && !c.episode && !this.pendingTutorial) this.newOrderCheck(c);
    if (c.episode) {
      this.whenCalm(() =>
        this.storyCue(c, () =>
          this.whenCalm(() => {
            this.guestEpisode = null;
            this.playEpisode(c.episode, () => this.startPendingTutorial());
          }, true)));
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
    return c.spot === 'table' ? TABLES[c.table ?? 0].x : c.spot === 'all' ? GAME_W / 2 : SPOT_X[c.spot];
  }

  showBubble(c, text, kind) {
    this.clearBubble(c);
    const pad = 6;
    const table = c.spot === 'table';
    // (Ah Gong's bubble leans left, clear of the sound button; with two tables both bubbles narrow so they never meet)
    const tb = table && (c.table ? TABLES[c.table].bubble : this.tableGuests.length > 1 ? TABLE_PAIR_BUBBLE : TABLE.bubble);
    const w = table ? tb.w : c.spot === 'all' || kind === 'say' ? 200 : 114; // what someone says (teaching) gets a wide, short bubble
    const x = Phaser.Math.Clamp(this.centerX(c) - w * (table ? tb.lean ?? 0.8 : 0.5), 4, GAME_W - w - 4);
    const words = layoutLine(this, text, x + pad, 0, w - pad * 2, (key) => this.openGlossary(key), { size: 11 });
    const extras = [];
    let h = words.height + pad * 2;
    if (kind === 'order' && c.n > 1) {
      extras.push(addText(this, x + pad, 0, `Cup ${c.served + 1}/${c.n}`, { size: 10, color: '#8a7a70' }));
    }
    if (kind === 'order') h += 8; // patience bar
    h += extras.reduce((sum, o) => sum + o.height + 1, 0);
    const y = table ? tb.y : BUBBLE_BOTTOM - h;
    words.objects.forEach((o) => o.setY(o.y + y + pad));
    let ey = y + pad + words.height;
    for (const o of extras) {
      o.setY(ey);
      ey += o.height + 1;
    }
    const frame = this.add.rectangle(x, y, w, h, 0xffffff).setOrigin(0).setStrokeStyle(2, COLORS.inkHex, 0.8).setDepth(30);
    const tx = Phaser.Math.Clamp(this.centerX(c), x + 12, x + w - 12);
    const tail = this.add.triangle(0, 0, tx - 7, y + h - 1, tx + 7, y + h - 1, tx, y + h + 8, 0xffffff).setOrigin(0).setDepth(30);
    [...words.objects, ...extras].forEach((o) => o.setDepth(31));
    const objs = [frame, tail, ...words.objects, ...extras];
    if (c?.def) objs.push(...this.heartRow(c, x + w - 4, y - 5)); // friendship, on the bubble's top edge
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

  // A row of small hearts (filled = friendship), right-aligned at (right, top).
  heartRow(c, right, top) {
    return Array.from({ length: MAX_HEARTS }, (_, i) =>
      this.add.image(right - (MAX_HEARTS - i) * 10, top, i < c.hearts ? 'heart' : 'heartEmpty').setOrigin(0).setDisplaySize(11, 10).setDepth(32));
  }

  // Friendship after a serve or a walk-out; a heart floats up when they like you more.
  makeFriends(c, tier) {
    this.friends = befriend(this.friends, c.def.id, tier);
    const now = hearts(this.friends[c.def.id]);
    if (now > c.hearts) {
      const x = this.centerX(c);
      const y = this.headTop(c) + 40; // over their body, clear of their bubble
      const heart = this.add.image(x - 26, y, 'heart').setDisplaySize(22, 20).setDepth(44);
      const t = addText(this, x - 12, y, `Friendship Lv ${now}`, { size: 12, bold: true, color: '#ffd1da', origin: [0, 0.5] }).setDepth(44);
      t.setStroke('#5a1a2a', 3);
      this.tweens.add({ targets: [heart, t], y: y - 34, alpha: { from: 1, to: 0 }, duration: 1900, delay: 500, ease: 'Sine.out', onComplete: () => (heart.destroy(), t.destroy()) });
      this.tweens.add({ targets: heart, scale: heart.scale * 1.25, duration: 160, yoyo: true, repeat: 2 });
      this.time.delayedCall(300, () => play('perfect'));
    }
    c.hearts = now;
  }

  // Waiting long: a line that shows how they feel about you (then their order again).
  sayWhileWaiting(c) {
    c.saidWait = true;
    this.showBubble(c, waitLine(c.hearts), 'say');
    this.time.delayedCall(2600, () => c.state === 'waiting' && this.showBubble(c, c.orderLine, 'order'));
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
    const fTip = friendTip(c.hearts, tier, res.tip);
    if (fTip) {
      res.tip += fTip;
      this.econ.money += fTip;
      this.econ.earnedToday += fTip;
      this.econ.tipsToday += fTip;
    }
    this.makeFriends(c, tier);
    c.served += 1;
    c.state = 'reacting';
    logEvent(this.log, 'serve', { who: c.def.id, wanted: c.orderText, made: formatCup(cup), tier, reasons, waitMs: Math.round(c.patienceMax - c.patienceMs) }, this.clockMs);
    this.tutorial?.onServed(c, tier);
    this.removeCup(slot);
    this.checkpoint();
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
      this.time.delayedCall(c.linger ?? (c.spot === 'table' ? TABLE_LINGER_MS : 1400), () => this.leave(c));
    }
  }

  headTop(c) {
    return Math.min(...c.sprites.map((s) => s.getBounds().top));
  }

  timeout(c) {
    c.state = 'reacting';
    this.makeFriends(c, 'timeout');
    applyTimeout(this.econ);
    logEvent(this.log, 'timeout', { who: c.def.id }, this.clockMs);
    this.checkpoint();
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
    this.tableGuests = this.tableGuests.map((g) => (g === c ? null : g));
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
    if (this.dial) this.updateDial(delta);
    for (const s of this.slots) {
      s.art.update(s.cup, delta, this.pouring?.slot === s ? { ingredient: this.pouring.tool.tool.ingredient } : null, this.targetFill(s));
      s.art.draw();
    }
    if (this.ended) return;

    // a pot held still over a cup starts pouring
    const aimed = this.aiming?.aim;
    if (aimed && !this.pouring) {
      aimed.ms += delta;
      if (aimed.ms >= POUR_DWELL_MS && aimed.slot.cup) {
        this.pouring = { tool: this.aiming, slot: aimed.slot };
        this.poseTool(this.aiming, true);
      }
    }
    // pouring while a tool is held over a cup
    if (this.pouring) {
      const { tool, slot } = this.pouring;
      const ing = tool.tool.ingredient;
      // the demo's hand stops on the exact frame its target is reached
      const stop = this.demo?.stop;
      const need = stop ? Math.max(0, ((stop.until - MEASURE[stop.measure](slot.cup)) / (TUNING.pourPerSec[ing] * (['kopi', 'teh', ...MALT].includes(ing) ? this.perks.pourMult : 1))) * 1000) : delta;
      this.pourInto(slot, ing, Math.min(delta, need + 1));
      if (stop && MEASURE[stop.measure](slot.cup) >= stop.until) this.pouring = this.aiming = null;
      const gap = ing === 'sugar' ? 220 : 900;
      if (time - this.lastPourSound > gap) {
        play(ing === 'sugar' ? 'sugar' : ['condensed', 'evap'].includes(ing) ? 'milk' : 'pour');
        this.lastPourSound = time;
      }
    }
    this.pourBar.update();
    this.updateCoach(delta);

    // The tutorial is a calm intro: the day clock and random spawns wait for it.
    const teaching = this.tutorial?.active || this.pendingTutorial;
    if (!teaching) this.clockMs = Math.min(TUNING.dayMs, this.clockMs + delta);
    this.refreshHud();
    if (this.clockMs >= TUNING.dayMs) {
      // 7pm: no one new comes in, but the customers already here still get their drinks
      if (!this.closing) this.startClosing();
      this.overtimeMs += delta;
      const empty = !this.allCustomers().length && !this.queue.length;
      if (empty || this.overtimeMs > TUNING.closingGraceMs) return this.endDay();
    }

    this.updateQueueChip();
    this.runPopups(delta);
    this.showNextCombo();
    if (!teaching) {
      this.runArrivals();
      this.maybeMidStory(delta);
      this.maybeBringTeacher();
    }

    for (const c of this.waitingCustomers()) {
      if (c.tutorial) continue; // no time pressure while learning
      c.patienceMs -= delta;
      this.updatePatienceBar(c);
      if (!c.saidWait && c.patienceMs < c.patienceMax * WAIT_LINE_AT) this.sayWhileWaiting(c);
      if (c.patienceMs <= 0) this.timeout(c);
    }
  }

  // People waiting in line stand half behind the counter crowd: a little sign over them says how many.
  updateQueueChip() {
    const n = this.queue.reduce((sum, c) => sum + c.n, 0);
    if (n === this.queueShown) return;
    this.queueShown = n;
    this.queueChip?.forEach((o) => o.destroy());
    this.queueChip = null;
    if (!n) return;
    const t = addText(this, 64, 178, `+${n} waiting`, { size: 11, bold: true, color: '#fff6dc', origin: 0.5 }).setDepth(33);
    const bg = this.add.rectangle(64, 178, t.width + 14, 20, 0xc8562e).setStrokeStyle(2, COLORS.inkHex).setDepth(32);
    this.queueChip = [bg, t];
    this.tweens.add({ targets: this.queueChip, scale: { from: 0.6, to: 1 }, duration: 200, ease: 'Back.out' });
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
    if (this.midQueued) return;
    this.midQueued = true;
    this.whenCalm(() => this.playStory('mid'));
  }

  // Called by the tutorial when it finishes or is skipped.
  startPendingTutorial() {
    if (!this.pendingTutorial || this.tutorialStarting) return;
    this.tutorialStarting = true;
    // the clock stays still until the tutorial has really started
    this.time.delayedCall(500, () => {
      this.pendingTutorial = false;
      this.tutorialStarting = false;
      this.tutorial.start();
    });
  }

  onTutorialDone() {
    this.time.delayedCall(1200, () => this.whenCalm(() => this.playStory('start')));
  }

  // Play today's episode for this moment (if any), then carry on.
  playStory(when, then = () => {}) {
    if (this.storyDone.has(when)) return then();
    this.storyDone.add(when);
    const ep = eventsFor(EVENTS, this.day, when)[0];
    if (!ep) return then();
    if (ep.guest && when !== 'end' && ep.prelude) {
      // the episode opens on its own (the note, the tin), a quiet moment at the stall, then the guest walks in
      const opening = { ...ep, beats: ep.prelude, choice: undefined, after: undefined, fame: 0, rush: 0 };
      this.playEpisode(opening, () => this.time.delayedCall(PRELUDE_GAP_MS, () => this.bringGuest({ ...ep, noTitle: true })));
      return then();
    }
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
    this.pouring = this.aiming = null;
    this.tweens.killTweensOf(this.feedback);
    this.feedback.setAlpha(0);
    storyMusic(EPISODE_MUSIC[ep.ep]);
    this.scene.launch('Drama', {
      ep,
      flags: this.flags,
      fame: this.econ.fame,
      vars: this.lineVars({ rating: this.rating ?? this.todayRating() }),
      owner: { name: this.owner.name, sprite: this.owner.sprite },
      onChoice: (opt) => this.applyStoryChoice(opt),
      onEnding: (e) => (this.ending = e.id),
      onDone: () => {
        endStoryMusic();
        this.scene.stop('Drama');
        this.scene.resume();
        if (ep.fame) this.econ.fame = clampFame(this.econ.fame + ep.fame);
        for (let i = 0; i < (ep.rush ?? 0); i++) this.arrivals.push({ at: this.clockMs + 800 + i * 2500, id: null });
        this.arrivals.sort((a, b) => a.at - b.at);
        logEvent(this.log, 'story', { id: ep.id, flags: this.flags.join(',') }, this.clockMs);
        this.refreshHud();
        this.checkpoint();
        if (this.lesson?.afterStory === ep.id && this.lessonState === 'waiting') this.whenCalm(() => this.showLesson(true), true);
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
        this.whenCalm(() => this.showLesson(who === l.teacher));
      }
    }
    this.lessonState = 'coming';
    c.lesson = true;
    c.lessonLine = who === l.teacher; // a stand-in teacher doesn't say the real teacher's line
    c.patienceMs = c.patienceMax = c.patienceMax * 1.5; // learning takes a moment
  }

  // Hands free: nothing held, poured, dosed, demoed or already open on top.
  calm() {
    return !this.paused && !this.demo && !this.dragging && !this.pouring && !this.dial && !this.ended && !this.scene.isActive('Drama');
  }

  // A card / demo / story that must not land mid-action: it opens once the stall has been calm a moment.
  // first = it goes to the front (the next part of something already started).
  whenCalm(fn, first = false) {
    if (first) this.popups.unshift(fn);
    else this.popups.push(fn);
  }

  runPopups(delta) {
    this.calmMs = this.calm() ? this.calmMs + delta : 0;
    if (!this.popups.length || this.calmMs < CALM_MS) return;
    this.calmMs = 0;
    this.popups.shift()();
  }

  // Pause the day for a modal card; resume when it closes.
  pauseFor(open) {
    if (this.paused) return;
    this.paused = true;
    this.pouring = this.aiming = null;
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
    this.lessonsDone += 1;
    this.checkpoint();
    logEvent(this.log, 'lesson', { day: this.day, features: this.lesson.features.join(',') }, this.clockMs);
    const spec = parseOrder(this.lesson.order);
    this.markTaught(this.lesson.order, [...this.lesson.features, ...featuresOf(spec)]);
    const combo = { items: this.comboItems(spec), cupTint: liquidColor(demoCup(spec)) };
    this.pauseFor((resume) => showRecipeCard(this, this.lesson, { showLine, combo, onClose: () => (resume(), this.nextLesson(), this.demoLessonOrder()) }));
  }

  // After a new-recipe card: the teacher's order is made once by the ghost hand (once per recipe ever).
  demoLessonOrder() {
    const c = this.allCustomers().find((x) => x.lesson && x.state === 'waiting' && !x.served);
    const seen = load('demosSeen', []);
    if (!c || seen.includes(c.orderText)) return;
    save('demosSeen', [...seen, c.orderText]);
    this.whenCalm(() => c.state === 'waiting' && !c.served && this.runDemo(c), true);
  }

  // Everything bought in the night shop shows up at the stall (src/data/stallProps.js).
  drawStallProps() {
    const machines = (this.run.owned ?? []).some((id) => MACHINE_TOOLS[id]?.feet === COUNTER); // they take the counter top
    for (const id of this.run.owned ?? []) {
      for (const d of STALL_PROPS[id] ?? []) {
        const p = machines && d.back ? { ...d, ...d.back, layer: 'wall' } : d;
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
    const entries = [...unlockedFeatures(this.day, this.perks.features)]
      .filter((f) => BOOK[f]?.example)
      .map((f) => {
        const spec = parseOrder(BOOK[f].example);
        return { ...BOOK[f], items: this.comboItems(spec), cupTint: liquidColor(demoCup(spec)) };
      });
    this.pauseFor((resume) => showRecipeBook(this, { entries, onClose: resume }));
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
    this.pouring = this.aiming = null;
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
    this.tableGuests = this.tableGuests.map(() => null);
    this.setFeedback(UI.closing);
    this.rating = this.todayRating();
    // tonight's story first (with the stall still open behind it), then the shutter, then the summary
    const owed = this.guestEpisode;
    const shutter = () => this.closeShutter(() => this.showSummary());
    const story = () => this.playStory('end', shutter);
    this.time.delayedCall(600, () => (owed ? this.playEpisode(owed, story) : story()));
  }

  showSummary() {
    // the shutters are down: the evening music, on into the night shop (Day 30: the finale plays on)
    playMusic(this.day >= MONTH_DAYS ? 'finale' : 'night');
    const e = this.econ;
    let tomorrow = nextDay(this.run, { money: e.money, fame: e.fame, flags: this.flags, rating: this.rating, ending: this.ending ?? this.run.ending, friends: this.friends });
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
      b.bg.setDepth(depth + 2).disableInteractive();
      b.txt.setDepth(depth + 3);
      this.time.delayedCall(SUMMARY_GRACE_MS, () => b.bg.setInteractive({ useHandCursor: true }));
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
