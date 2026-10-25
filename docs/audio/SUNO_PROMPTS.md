# Suno prompts: the Kopi Stall Empire soundtrack (2026-10-25)

**The sound:** a Singapore HDB neighbourhood on a warm morning. Modern and clean (lo-fi beats, soft city-pop
chords, warm electric piano), with a nostalgic heart: the gentle guitar-and-voice feel of 80s Singapore campus
folk (xinyao), a hint of Malay keroncong strumming, a touch of erhu or guzheng only as colour, never as "Chinese
movie music". Cozy, sunny, a little bittersweet, never sleepy.

## How to make them (and keep your usage low)
- **Instrumental ON** for every track. Paste the **Style** text into the style box, the **Exclude styles** line from
  track 1 into the exclude box (every track), and the **Lyrics** text
  (just the section tags) into the lyrics box. Use the title given.
- Suno makes 2 versions per go. Pick the better one; only re-roll a track you really don't like.
- **MP3 is fine.** Save into `art/audio/` with the file name given, then tell me.
- **Trimming and looping are my job.** Suno songs start with an intro and end with an outro or a fade. I cut each one so the
  end flows straight back into the start (no gap, no fade), so it can play the whole 2-minute day, or a long
  night in the shop, without anyone noticing. That's why every prompt asks for a steady groove with no big
  build-up, no tempo change and no ending: that makes a clean loop much easier to find.
- Never put a real artist or song name in a Suno prompt (it refuses, and we must not copy anyone).

---

## 1. Stall day loop: the one you hear most
**For:** the whole serving day, looping for the full day. **Feeling:** chill and easy, sitting quietly *behind* the
game (you notice the pouring and the customers, not the music), but with a light, happy bounce that keeps you
wanting to serve one more cup. Never busy, never loud, never boring.
**File:** `art/audio/day.mp3` · **Title:** `Corner Kopitiam`

**DONE (2026-10-25):** your first take is in the game. It plays the start once, then loops 0:12 → 1:52 all day
with a 2-second crossfade (`src/data/music.js`, trimmed by `tools/trim_mp3.py`). The prompts below are for a
smoother remake later, if you ever want one: they keep the middle the same all the way through.

*Why game music is different:* a playlist-style song builds up, changes section, and fades out. Game background
music is one relaxed groove that just keeps going: a simple tune that repeats, a steady soft pulse from the first
second, and changes only at the very start and the very end. That's what these prompts ask for.

**Style (version A: soft and bouncy)**
> chill cozy video game background music, soft and low-key, sits quietly in the background, mellow ukulele and soft marimba, light pizzicato, warm electric piano pads, gentle hand percussion, sparse and airy arrangement, simple happy repeating melody, light bouncy groove, quietly uplifting, sunny Southeast Asian neighbourhood morning, 92 bpm, one steady chill groove the whole way through, the same relaxed section repeating, only a short soft intro and a gentle ending, instrumental

**Style (version B: more Singapore, a little nostalgic)**
> chill cozy video game BGM, soft and low-key background music, sunny Singapore kopitiam morning, gentle nylon guitar and soft ukulele strums, light glockenspiel melody, xinyao campus folk warmth, soft keroncong lilt, brushed snare and shaker kept quiet, warm round bass, sparse and airy, quietly cheerful, 90 bpm, one steady chill groove the whole way through, the same relaxed section repeating, only a short soft intro and a gentle ending, instrumental

**Exclude styles** *(the box under the style box; if your Suno version has it)*
> vocals, choir, lo-fi hip hop, cinematic, epic, loud, busy, heavy drums, energetic, dramatic, breakdown, key change, tempo change, solo, drum solo, long intro

**Lyrics box** (the middle is one section, repeated, so Suno keeps it the same)
```
[Instrumental]
[Short Soft Intro]
[Chill Groove]
[Chill Groove]
[Chill Groove]
[Chill Groove]
[Chill Groove]
[Gentle Ending]
```

**Pick the version where:** the tune starts within 2–3 seconds, the middle sounds the same from minute 1 to
minute 2, nothing suddenly gets louder or slower, and you could leave it on for 10 minutes while doing something
else without it getting on your nerves. Quiet and gentle wins over catchy and busy.

*(Optional later: a `day-lunch` version with the same style plus "busier, 104 bpm, a little more percussion" for
the lunch rush; I'd crossfade into it at 11am and back out at 2pm.)*

## 2. Title theme
**For:** the title screen and choosing Jun or Mei. **Feeling:** "welcome home": hopeful, nostalgic, the first sip of the day.
**File:** `art/audio/title.wav` · **Title:** `Kopi at Sunrise`

**Style**
> video game title screen music, cozy and nostalgic, Singapore campus folk feeling, warm acoustic guitar, glockenspiel melody, soft electric piano, gentle brushed drums, hopeful, sunrise over HDB blocks, bittersweet and warm, memorable simple theme, 84 bpm, loopable, instrumental

**Lyrics box**
```
[Instrumental]
[Intro]
[Main Theme]
[Main Theme]
[Bridge]
[Main Theme]
```

## 3. Night: shutters down and the night shop
**For:** the day summary, the quiet night and Uncle Tan's catalogue. **Feeling:** tired but proud, cool night air, a fan humming, counting the day's coins.
**File:** `art/audio/night.wav` · **Title:** `Shutters Down`

**Style**
> cozy video game night shop music, calm evening BGM, Singapore HDB void deck at night, soft vibraphone melody, muted electric piano, warm upright bass, slow brushed drums, content and a little sleepy, simple repeating theme, 76 bpm, loopable, no ending, instrumental

**Lyrics box**
```
[Instrumental]
[Groove]
[Main Theme]
[Groove]
[Main Theme]
```

## 4. Story: warm (the heart-felt moments)
**For:** episodes with feeling: the kids' twenty cents, Aunty Lim's notebook, the prologue flashback, Uncle Tan.
**Feeling:** tender, grateful, a lump in the throat but smiling.
**File:** `art/audio/story-warm.wav` · **Title:** `Uncle Tan's Teh`

**Style**
> heartfelt video game story music, tender cutscene BGM, fingerpicked nylon guitar, soft piano, warm erhu melody, light strings, Singapore 1980s campus folk feeling, gentle, bittersweet, simple repeating theme, 72 bpm, no big climax, loopable, instrumental

**Lyrics box**
```
[Instrumental]
[Verse]
[Chorus]
[Verse]
[Chorus]
```

## 5. Story: comic and sneaky
**For:** the funny and tense episodes: Kenneth's offer, the hygiene inspector, Oyen's double life, the blackout, Kopi Ninja.
**Feeling:** cheeky, tiptoeing, "uh-oh", playful drama, never scary.
**File:** `art/audio/story-comic.wav` · **Title:** `Kopi Ninja`

**Style**
> funny sneaky video game cutscene music, comedy caper BGM, pizzicato strings, plucky bass, bassoon, woodblock and light percussion, cheeky, mischievous, light drama, Southeast Asian kampung flavour, simple repeating theme, 104 bpm, loopable, instrumental

**Lyrics box**
```
[Instrumental]
[Groove]
[Main Theme]
[Groove]
[Main Theme]
```

## 6. The prologue and the finale
**For:** the opening ("One Month to Try") and Day 30 (opening the tin, the ending). **Feeling:** a dream coming true, family, gratitude, a new beginning.
**File:** `art/audio/finale.wav` · **Title:** `One Month to Try`

**Style**
> emotional uplifting instrumental, the Corner Kopitiam theme played big and warm, acoustic guitar, piano, soft strings, gentle erhu solo, light drums building gently, Singapore neighbourhood nostalgia, hopeful, grateful, bittersweet happy tears, 80 bpm, instrumental

**Lyrics box**
```
[Instrumental]
[Intro]
[Verse]
[Chorus]
[Bridge]
[Chorus]
[Outro]
```
*(This one doesn't need to loop: it plays once, under the big moments.)*

---

## Short stings: I make these in code
The episode title "dun dun" and the 下集 sting are 2–3 seconds. Suno isn't good at that length, and the game
already synthesises its sound effects, so I'll make them myself to match the soundtrack's key.

## What happens in the game
- Music fades between scenes (title → day → story → night) instead of cutting.
- The day music plays **soft, well under the sound effects** (pours, cups, customers stay in front), and loops with
  no gap for the whole day.
- During a story the day music dips quietly under it, then comes back.
- The existing ♪ on/off button controls music and sound together (a separate music volume can come later).
- Total size target: about 5 MB for all of it, so the game still loads fast on a phone.
