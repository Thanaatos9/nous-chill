# Dice Forge — CLAUDE.md

## Project

Simple dice roller app. Two D6 dice, click to roll, animated result.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS (custom animations in globals.css)

## Key files

- `src/app/page.tsx` — main page, roll logic, layout
- `src/components/Die.tsx` — single die component (pip grid, animations)
- `src/app/globals.css` — custom keyframe animations (roll, glow-pulse, result-pop, pip-appear)

## Dev commands

```bash
npm run dev     # dev server at :3000
npm run build   # production build
npm run lint    # eslint
```

## Design decisions

- Dark purple/black radial gradient background
- Dice faces use a 3x3 CSS grid for pip positions
- Rolling state triggers CSS animation via className toggle
- Pips remount after roll to retrigger pip-appear animation
- `isCritical` (total 12) → gold gradient; `isSnakeEyes` (1+1) → special label

## Deployment

Coolify — point to GitHub repo, build: `npm run build`, start: `npm run start`, port 3000.
