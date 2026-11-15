---
type: Concept
title: Platform Overview
description: Architecture, identity, and mission of the Yozora anime intelligence platform.
resource: https://yozora.moe/about
tags: [anime, architecture, yozora, discovery]
timestamp: 2026-09-27T00:00:00Z
---

# Yozora (夜空) — Platform Overview

[Yozora](https://yozora.moe) is an anime catalog, broadcast radar, and theme player. It lists the current season, shows episode countdowns from AniList airing times (JST), streams creditless opening and ending themes via AnimeThemes.moe, and keeps a personal watchlist.

## Core Architectural Pillars
1. **Performance**: Built with Astro 7 islands architecture on Cloudflare Workers with two-tier caching (L1 single-flight in-memory + L2 Workers edge Cache API) and static-first prerendering.
2. **Resilience**: Powered by the [layered cache](dual-engine-failover.md) (memory + Workers edge cache + CDN edge) over AniList GraphQL.
3. **Accuracy**: Real-time broadcast schedules maintained via the [Live Airing Radar](airing-radar.md).
4. **Archival Quality**: Integrated [Creditless Theme Player](theme-player.md) with 1080p clean visual sequences.
5. **Open & Private**: 100% Free and MIT licensed, with details in [Pricing Specification](pricing.md). Zero user tracking or third-party ads.
