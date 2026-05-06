# Slug4Dead

Slug4Dead is a browser-based 16-bit style 2D shooter inspired by Metal Slug and Left 4 Dead. The current project is an early playable alpha slice built with TypeScript, Phaser 3, and Vite.

The design source of truth lives under `docs/hld/`. Implementation should stay aligned with those documents, especially the player, entity, weapon, system, and level files.

## Current Playable Slice

The game currently starts at a pre-level menu and launches the Alpha Test Ground. The alpha level is a flat 2000 pixel test area with a player spawn, common infected enemies, pistol shooting, health and damage handling, bullet travel, a HUD, pause/death states, and a safe zone at the far end.

Controls:

- `A`: move left
- `D`: move right
- `Space`: jump
- `Mouse 1`: fire pistol
- `Esc`: pause, resume, or return to menu when dead or when the safe zone is reached

Placeholder art is used for now. Entities are rendered with simple colored shapes so gameplay behavior can be developed before final sprites exist.

## Tech Stack

- TypeScript
- Phaser 3
- Vite
- Vitest

The HLD also identifies Docker, Terraform, and AWS Lightsail as future deployment infrastructure choices, but the current repository is focused on the browser game scaffold and playable alpha implementation.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Project Layout

```text
.
├── docs/                  # HLD and game design documents
├── src/
│   ├── game/
│   │   ├── entities/      # Player, enemies, bullets, weapons, projectiles
│   │   ├── scenes/        # Menu and alpha level scenes
│   │   ├── config.ts      # Phaser game configuration
│   │   ├── constants.ts   # Runtime values mirrored from HLD cards
│   │   └── trajectory.ts  # Shared projectile math
│   ├── main.ts            # Browser entrypoint
│   └── styles.css         # Page and canvas layout
├── tests/                 # Vitest coverage for constants, pistol logic, trajectory
├── index.html
├── package.json
├── tsconfig.json
└── state.md               # Running project state log
```

## Development Notes

- Do not change files under `docs/` unless explicitly asked.
- Keep runtime constants aligned with the corresponding HLD cards.
- Add focused tests for gameplay logic that can run outside the browser.
- Use placeholder art when final sprites are unavailable, but keep each entity visually distinct.
- Update `state.md` after project actions so the next agent can recover context.

## Known Implementation Notes

- The alpha HLD includes a spitter enemy at `spawn_location: 1500`.
- Spitter and enemy projectile entity files exist, but the current alpha scene only instantiates common infected enemies.
- Production builds currently pass, with a non-blocking Phaser bundle-size warning noted in the state log.
