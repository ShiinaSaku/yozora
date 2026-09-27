---
type: Concept
title: Dual-Engine Catalog Failover
description: Resilient data aggregation combining AniList GraphQL with Jikan v4 REST for 99.9% uptime.
resource: https://yozora.moe/about
tags: [resilience, failover, anilist, jikan, myanimelist, api]
timestamp: 2026-09-27T00:00:00Z
---

# Dual-Engine Catalog Failover

Yozora employs a dual-provider data architecture to prevent third-party rate limits or upstream outages from interrupting user service.

## Architecture
1. **Primary Provider (AniList GraphQL)**: High-fidelity GraphQL queries for seasonal cour rosters, character casts, and voice actors.
2. **Failover Provider (Jikan REST API v4)**: Open-source MyAnimeList proxy that engages automatically if AniList returns HTTP 429 (rate-limit) or 5xx server errors.
3. **Data Normalization Layer**: Automatically harmonizes differing ID schemes, score distributions, and title formats into Yozora's type-safe schema.
