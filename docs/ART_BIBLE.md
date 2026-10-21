# Kopi Stall Empire: Art Bible

Every piece of art should look like it came from the same hand. The style reference is
**`art/source/owner-jun-mei.webp`** (Jun & Mei). Attach it to every ChatGPT request.

## Style rules
- **Chibi proportions:** big round head (about half the height), small body, short legs.
- **Pixel-styled HD:** visible chunky "pixels", but a full-resolution image.
- **Thick dark outline** around the whole figure; softer inner lines.
- **Soft 2–3 tone shading**, warm light from the top-left. Pink blush, expressive faces.
- **Palette:** warm kopitiam browns, cream, faded pastels. Background scenes are pastel sky-blue and mint tiles.
- **Pose:** full body, standing, **3/4 view facing right** (left-facing = we mirror it).
- **One character per image**, centred, nothing touching the edges.
- **Plain flat white or transparent background**, no floor shadow.
- **No** text, speech bubbles, name labels, sparkles/sweat drops floating separately, or props
  lying on the floor (props must be **held** or worn).
- **Never:** real brand logos or monograms (Grab, LV…), national flags, the Merlion or other
  landmark/mascot trademarks, real people.

## Import (done on the laptop)
1. Save the image into `art/source/` (e.g. `art/source/kid-darren.png`).
2. Cut out: `.venv/Scripts/python tools/prep_still.py art/source/kid-darren.png --names darren --out art/prepped`
   (several characters in one image: `--names a b c`; crowded: add `--regions x0:x1 ...`).
3. Add `"darren": <display height>` to `src/data/spriteSizes.json`
   (adults ~136–142, kids ~104–118, seated with table ~134, Oyen 56).
4. Export: `.venv/Scripts/python tools/build_sprites.py darren` → `public/sprites/darren.png`.

## Master prompt template
> Chibi pixel-art game character in exactly the same style as the attached image (thick dark
> outline, big round head, small body, soft 2–3 tone shading, cute blush). Full body, standing,
> 3/4 view facing right. Character: **[WHO + LOOK + PROP IN HAND + EXPRESSION]**.
> Plain flat white background, no shadow, no text, no speech bubble, no logos, no flags,
> no landmarks, nothing on the floor. One character only, centred, nothing touching the edges.

## Ready-to-paste prompts (still missing)

### The four sec school kids, one image each
Uniform for all: white short-sleeve school shirt with a small pocket badge, navy shorts (boys) or navy pleated skirt (girls), white socks, navy canvas shoes.
- **Darren:** "...Character: Darren, 14, the loud one. Spiky messy brown hair, big open-mouth grin, green backpack, holding up an iced Milo Dinosaur (iced Milo in a plastic cup with a heap of Milo powder on top) in one hand, other fist pumped."
- **Wei Ling:** "...Character: Wei Ling, 14, the smart one. Long brown hair in a high ponytail, black glasses, lavender backpack, counting coins in her palm with a small pink coin purse, slightly worried smile."
- **Hafiz:** "...Character: Hafiz, 14, the funny one. Short dark hair under a backwards navy cap, winking, doing a finger-gun, black backpack, holding an iced Milo Dinosaur."
- **Jia Hui:** "...Character: Jia Hui, 14, the quiet one. Shoulder-length dark bob with straight fringe, pink backpack with a small bunny keychain, hugging a sketchbook to her chest, shy small smile. Standing (not sitting)."

### Sophie (tourist): edit of the existing image
> Edit only the tote bag: replace the flag keychain with a small kopi-cup keychain and the
> Merlion print with a cute coffee-cup doodle. Keep everything else exactly the same.
> Plain flat white background, no shadow.

### Uncle Tan: standing version (for when he visits the stall)
> "...Character: Uncle Tan, retired kopi stall owner in his late 60s. Grey hair, white moustache,
> white singlet, small towel over one shoulder, dark shorts, black slippers, big proud grin,
> holding a steaming kopi pot in one hand and giving a thumbs-up with the other."

### Kopitiam background plate (no people)
> Pixel-art game background in exactly the same style as the attached image. Inside a cosy
> Singapore kopitiam, viewed straight on, portrait 9:8 crop. Pastel mint and white wall tiles
> on the lower half, a cream wall above with a hand-painted drinks menu board (simple
> drink-cup icons, no readable brand names), a ceiling fan, warm hanging lights, a shelf with
> kettles and condensed-milk cans (no labels), a potted plant in the corner. Soft warm
> afternoon light. No people, no text, no logos.

### Counter front (wide strip)
> Pixel-art game prop in exactly the same style as the attached image. A long wooden kopi
> stall counter seen from the front, warm brown wood, a cream signboard strip along the top edge
> left blank, a few cups and a tray on top at the right end. Wide 4:1 strip. Plain white
> background, no shadow, no text, no logos.

### Drink cups (one image, 6 cups in a row, evenly spaced)
> Pixel-art game icons in exactly the same style as the attached image. Six kopitiam drinks in a
> neat row with clear gaps, same size and angle: (1) Kopi in a white ceramic cup on a saucer,
> (2) Kopi O (very dark) in a glass cup, (3) Kopi C (medium brown) in a glass cup, (4) Teh
> (light orange-brown) in a white ceramic cup, (5) Teh C in a glass cup, (6) Milo Dinosaur:
> iced Milo in a clear plastic cup with a heap of Milo powder on top and a straw. Plain white
> background, no shadow, no text, no logos.
