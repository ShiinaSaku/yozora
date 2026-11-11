<div align="center">

# Yozora

**The modern anime discovery engine, broadcast radar, and theme song player.**

[Live Application](https://yozora.moe) · [Report Bug](https://github.com/shiinasaku/yozora/issues) · [Feature Request](https://github.com/shiinasaku/yozora/issues)

<br />

<img src="./public/preview.png" alt="Yozora Interface Preview" width="100%" />

</div>

---

## Overview

Yozora is a fast, modern anime web platform designed for discovering seasonal releases, tracking live television broadcast countdowns, listening to creditless opening and ending themes, and organizing personal watchlists.

## Features

- **Live Airing Radar**: Real-time episode countdowns synchronized with Japanese television broadcast schedules.
- **Theme Player**: 1080p creditless anime openings and endings with scrubbable seeking, playback speed, picture-in-picture, fullscreen, keyboard shortcuts, and an audio-only vinyl mode.
- **Seasonal Catalog**: Browse current and upcoming anime seasons with instant genre, score, and format filters.
- **Personal Watchlist**: Track watching progress, organize status shelves, and curate your profile.
- **Command Palette**: Instant keyboard-driven navigation and media search with `Cmd + K`.

## Tech Stack

- TanStack Start (React 19, Vite, Cloudflare Workers)
- Tailwind CSS v4
- Base UI / shadcn
- AniList GraphQL + AnimeThemes GraphQL
- Bun

## Getting Started

### Prerequisites

- Bun (v1.4 or higher)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/shiinasaku/yozora.git
cd yozora
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `bun run dev` — Start local development server
- `bun run build` — Build production bundles
- `bun run preview` — Preview production build locally
- `bun run typecheck` — Run TypeScript type checking
- `bun run codegen` — Regenerate GraphQL clients (AnimeThemes schema snapshot is refreshed via `curl` with a User-Agent header; see `schemas/animethemes-introspection.json`)

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
