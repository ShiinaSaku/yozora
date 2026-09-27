---
type: Concept
title: Platform Overview
description: Architecture, identity, and mission of the Yozora anime intelligence platform.
resource: https://yozora.moe/about
tags: [anime, architecture, yozora, discovery]
timestamp: 2026-09-27T00:00:00Z
---

# Yozora (夜空) — Platform Overview

[Yozora](https://yozora.moe) is a fast modern anime discovery platform, broadcast radar, and theme player. It indexes seasonal television releases, delivers millisecond-accurate broadcast countdowns synced to Tokyo television networks (JST), streams 1080p creditless opening (OP) and ending (ED) themes via AnimeThemes.moe, and supports seamless AniList watchlist tracking.

## Core Architectural Pillars
1. **Performance**: Built with TanStack Start, React 19, Vite, and Nitro SSR with two-tier caching (L1 single-flight in-memory + L2 distributed Upstash Redis).
2. **Resilience**: Powered by [Dual-Engine Failover](dual-engine-failover.md) combining AniList GraphQL and Jikan v4 REST.
3. **Accuracy**: Real-time broadcast schedules maintained via the [Live Airing Radar](airing-radar.md).
4. **Archival Quality**: Integrated [Creditless Theme Player](theme-player.md) with 1080p clean visual sequences.
5. **Open & Private**: 100% Free and MIT licensed, with details in [Pricing Specification](pricing.md). Zero user tracking or third-party ads.
