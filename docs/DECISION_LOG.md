# Decision Log (decisions in force now)

| Date | Decision | Why |
|------|----------|-----|
| 2026-10-21 | System font (Noto Sans SC / PingFang / YaHei) instead of a pixel font | CJK pixel fonts are large; Mandarin is needed |
| 2026-10-21 | Drink cup still drawn by palette-swapping the `kopiC` pixel map (NEAREST, scaled x6) | Placeholder until drink art exists |
| 2026-10-21 | Vitest for pure systems (order parsing, scoring) | Order grammar is the core rule set; cheap to test |
| 2026-10-21 | Character art = AI-generated pixel-styled stills, HD finish (premultiplied LANCZOS), not a forced pixel grid | Forced grid broke outlines/faces (docs/art/finish-comparison.png); user chose option A |
| 2026-10-21 | Logical 360x640; backbuffer = logical x min(3, fit x DPR); camera zoom = render scale | Sharp HD art + CJK text on retina phones; fractional fit avoids big letterbox |
| 2026-10-21 | Player is a young owner, Jun or Mei (choice saved in localStorage); Uncle Tan = retired, mentioned only in v0.1 | User request |
| 2026-10-21 | Ah Gong uses a side-table slot; groups take the whole counter; tap a customer to choose who SERVE targets | Seated art + readable layout at 360 wide |
