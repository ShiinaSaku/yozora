---
type: Concept
title: Layered Caching & Catalog Resilience
description: Three-layer caching (memory, Redis, CDN edge) over the AniList GraphQL catalog with automatic upstream retries.
resource: https://yozora.moe/about
tags: [resilience, caching, anilist, redis, cdn, api]
timestamp: 2026-11-11T00:00:00Z
---

# Layered Caching & Catalog Resilience

Yozora keeps catalog responses fast and available through a layered cache and defensive upstream handling, rather than a secondary metadata provider.

## Architecture
1. **Catalog Provider (AniList GraphQL)**: High-fidelity GraphQL queries for seasonal cour rosters, character casts, and voice actors. Requests retry automatically on HTTP 429 (rate-limit) and 5xx errors.
2. **Theme Provider (AnimeThemes GraphQL)**: Creditless OP/ED streams and song credits, matched to AniList IDs via `filterAnimeByExternalSite`.
3. **Layered Cache**:
   - **L1 In-Memory**: Per-isolate map with single-flight promise deduplication to prevent cache stampedes.
   - **L2 Distributed**: Upstash Redis over HTTP REST, with smart per-status TTLs (finished anime cached ~30 days, airing anime until the next episode).
   - **L3 CDN Edge**: `Cache-Control` / `CDN-Cache-Control` headers with stale-while-revalidate on every server function response.
4. **Fail-Open Design**: If Redis or memory errors occur, requests gracefully fetch upstream data without crashing.
