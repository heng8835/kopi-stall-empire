# Kopi Stall Empire (working title)

A chill, cozy kopi stall game set in Singapore kopitiam daily life. Learn real kopitiam
lingo ("Kopi C siew dai peng"), serve the regulars, enjoy the small daily drama.

**Play the current build (phone or desktop):** https://heng8835.github.io/kopi-stall-empire/

Status: v0.1 vertical slice in progress. Design: [`GAME_DESIGN.md`](GAME_DESIGN.md).

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
npm run build    # -> dist/
```
Every push to `main` runs the tests and deploys to GitHub Pages
(`.github/workflows/deploy.yml`).

Art pipeline and style rules: [`docs/ART_BIBLE.md`](docs/ART_BIBLE.md).
Character art is AI-generated (ChatGPT) and processed with the tools in `tools/`.
