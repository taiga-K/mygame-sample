# AGENTS.md

## Cursor Cloud specific instructions

Boom Arc is a single-service, client-only Vite + TypeScript browser game (HTML5 canvas). There is no backend, database, or auth. Node 22 is used (matches the GitHub Pages CI workflow).

Standard commands are documented in `README.md` and `package.json` scripts:

- Run (dev): `npm run dev` — serves on `http://127.0.0.1:5173/` (bound to `127.0.0.1` via the script's `--host`).
- Lint: `npm run lint`
- Build: `npm run build` (runs `tsc --noEmit` then `vite build`, output to `dist/`)
- Level solver "test": `npm run test:clear` — runs `scripts/clear-test.ts` (via `tsx`), which auto-solves every level and exits non-zero if any level cannot be cleared. This is the closest thing to an automated test suite; there is no unit-test framework.

Non-obvious notes:

- The game is played by dragging on the canvas to aim and releasing to throw a bomb; verifying gameplay requires browser/computer-use interaction, not just loading the page.
- The dev server binds to `127.0.0.1` only (not `0.0.0.0`); use `http://127.0.0.1:5173/` when testing.
- ESLint uses Feature-Sliced Design rules (`@feature-sliced/eslint-config`) and only lints `.ts` files under `src` (`scripts/` and `vite.config.ts` are ignored).
