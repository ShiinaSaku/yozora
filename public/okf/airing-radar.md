---
type: Concept
title: Live Airing Radar
description: Real-time broadcast countdowns synchronized with Japanese television networks in Tokyo (JST UTC+9).
resource: https://yozora.moe/airing
tags: [airing, broadcast, radar, jst, countdown]
timestamp: 2026-09-27T00:00:00Z
---

# Live Airing Radar

The [Live Airing Radar](https://yozora.moe/airing) on Yozora tracks television broadcast schedules across major Japanese networks (Tokyo MX, BS11, AT-X, MBS, Fuji TV).

## Key Characteristics
- **Tokyo JST Synchronization**: Timetables are anchored to Japanese Standard Time (JST, UTC+9).
- **Millisecond Precision**: Real-time reactive countdown tickers indicate exact premiere windows.
- **Weekly Schedule Layout**: Broadcast events organized Monday through Sunday.
- **Failover Safe**: Backed by Yozora's [Dual-Engine Failover](dual-engine-failover.md) to ensure continuous timetable availability.
- **Schema.org Integration**: Structured `BroadcastEvent` and `ItemList` JSON-LD markup for Answer Engine Optimization.
