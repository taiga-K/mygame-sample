# Boom Arc

Angle, power, and blast force in a short physics puzzle game.

## Play

Drag on the game field to aim. Release to throw a bomb. Knock every enemy off the platforms
before bombs run out.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The app is a Vite + TypeScript static site. `npm run build` writes the GitHub
Pages-ready artifact to `dist/`.

## Architecture

The source uses a small Feature-Sliced Design layout:

- `app`: app bootstrap and global styles
- `pages`: page composition
- `widgets`: game stage composition
- `features`: bomb toss gameplay
- `entities`: actors and level data
- `shared`: config and reusable canvas/physics helpers

ESLint includes the official `@feature-sliced/eslint-config` rules.
