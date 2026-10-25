# Suno prompts: the Kopi Stall Empire soundtrack (2026-10-25)

**The sound:** a Singapore HDB neighbourhood on a warm morning. Modern and clean (lo-fi beats, soft city-pop
chords, warm electric piano), with a nostalgic heart: the gentle guitar-and-voice feel of 80s Singapore campus
folk (xinyao), a hint of Malay keroncong strumming, a touch of erhu or guzheng only as colour, never as "Chinese
movie music". Cozy, sunny, a little bittersweet, never sleepy.

## How to make them (and keep your usage low)
- **Instrumental ON** for every track. Paste the **Exclude styles** line from track 1 into every track too. Paste the **Style** text into the style box and the **Lyrics** text
  (just the section tags) into the lyrics box. Use the title given.
- Suno makes 2 versions per go. Pick the better one; only re-roll a track you really don't like.
- **Download as WAV if your plan allows it, else MP3.** Save into `art/audio/` with the file name given, then tell me.
- **Looping is my job.** Suno songs start with an intro and end with an outro or a fade. I cut each one so the
  end flows straight back into the start (no gap, no fade), so it can play the whole 2-minute day, or a long
  night in the shop, without anyone noticing. That's why every prompt asks for a steady groove with no big
  build-up, no tempo change and no ending: that makes a clean loop much easier to find.
- Never put a real artist or song name in a Suno prompt (it refuses, and we must not copy anyone).

---

## 1. Stall day loop: the one you hear most (the most important, do this first)
**For:** the whole serving day, looping for the full day. **Feeling:** warm, sunny, busy-but-easy, a smile while you work.
**File:** `art/audio/day.wav` · **Title:** `Corner Kopitiam`

*Why the first try sounded wrong:* "lo-fi hip hop" makes Suno write a playlist song (long intro, a beat that
builds, a fade at the end). Game background music is different: a short, catchy melody that repeats, a steady
bouncy pulse from the first second, lots of space so it never tires you out, and no big moments. So these
prompts say **video game background music** and describe it like a cozy shop game's BGM.

**Style (version A: cozy and bouncy, try this first)**
> cozy video game background music, shop management game BGM, cheerful and relaxed, ukulele, marimba, soft pizzicato strings, light hand percussion, warm electric piano chords, simple catchy repeating melody, steady bouncy rhythm from the start, Southeast Asian neighbourhood morning, gentle erhu phrase, 100 bpm, loopable, no build-up, no ending, instrumental

**Style (version B: more Singapore, a little nostalgic)**
> cozy video game BGM, sunny Singapore kopitiam morning, nylon guitar and ukulele strumming, glockenspiel melody, soft xinyao campus folk feeling, light keroncong rhythm, brushed snare and shaker, warm bass, cheerful, nostalgic, simple repeating 8-bar theme, steady tempo, 96 bpm, loopable game soundtrack, instrumental

**Exclude styles** *(the box under the style box; if your Suno version has it)*
> vocals, choir, lo-fi hip hop, ambient, cinematic, epic, fade out, slow intro, drum solo

**Lyrics box**
```
[Instrumental]
[Theme A]
[Theme B]
[Theme A]
[Theme B]
[Theme A]
```

**Pick the version where:** the tune starts within the first 2–3 seconds, you could hum the melody after one
listen, and nothing suddenly gets louder or slower. It's fine if it's 2–3 minutes long; I cut one clean loop out of it.

*(Optional later: a `day-lunch` version with the same style plus "busier, 112 bpm, extra percussion" for the
lunch rush. I'd crossfade into it at 11am and back out at 2pm. Only if you like the idea after hearing the first.)*

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
- During a story the day music dips quietly under it, then comes back.
- The existing ♪ on/off button controls music and sound together (a separate music volume can come later).
- Total size target: about 5 MB for all of it, so the game still loads fast on a phone.
