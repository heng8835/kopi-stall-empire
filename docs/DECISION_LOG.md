# Decision Log (decisions in force now)

| Date | Decision | Why |
|------|----------|-----|
| 2026-10-21 | Logical 180x320; canvas sized 180*z x 320*z with integer camera zoom (`src/systems/view.js`) | Pixel-perfect sprites AND crisp CJK text; CSS-only zoom blurred Mandarin |
| 2026-10-21 | System font (Noto Sans SC / PingFang / YaHei) instead of a pixel font | CJK pixel fonts are large; Mandarin is needed |
| 2026-10-21 | Drinks drawn by palette-swapping the `kopiC` map | Only one drink sprite exists; avoids 6 hand-drawn cups for M1 |
| 2026-10-21 | Vitest for pure systems (order parsing, scoring) | Order grammar is the core rule set; cheap to test |
