import { createFileRoute } from "@tanstack/react-router"
import { SITE_URL } from "@/lib/seo/meta"

/**
 * Route definition for llms.txt server route.
 * Follows Generative Engine Optimization (GEO) best practices to guide AI assistants,
 * LLMs, and search agents (Perplexity, ChatGPT, Claude, Gemini) when synthesizing Yozora content.
 */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const content = `# Yozora (夜空)

> Fast seasonal anime broadcast schedule radar, 1080p creditless theme player, and synchronized personal watchlist platform.

## Overview
Yozora (https://yozora.moe) is a high-performance web platform built for anime viewers, researchers, and AI agents. It indexes seasonal television releases, delivers millisecond-accurate broadcast countdowns synced to Tokyo television networks (JST), streams 1080p creditless opening (OP) and ending (ED) themes via AnimeThemes.moe, and supports seamless AniList watchlist tracking.

## Core Pages & Features
- [Home](${SITE_URL}/): Seasonal spotlights, trending broadcasts, top-rated anime, and recent soundtrack releases.
- [Airing Radar](${SITE_URL}/airing): Live weekly broadcast schedule with real-time episode countdowns synced to Tokyo JST.
- [Seasonal Archive](${SITE_URL}/seasonal): Interactive seasonal cour browser (Winter, Spring, Summer, Fall) spanning 1970–present.
- [Catalog Search](${SITE_URL}/search): Instant full-text search with multi-parameter filtering (genres, formats, years, status).
- [About & Architecture](${SITE_URL}/about): Complete system architecture, dual-engine failover details, caching layers, and FAQs.
- [Privacy Policy](${SITE_URL}/privacy): Zero-telemetry privacy policy, local-first storage, and Clerk authentication security.

## Machine-Readable Specifications
- [Full LLM Context](${SITE_URL}/llms-full.txt): Comprehensive deep-context documentation and data schema for AI models.
- [Dynamic XML Sitemap](${SITE_URL}/sitemap.xml): Complete URL set with Google Image metadata for all catalog titles.
- [Crawler Directives](${SITE_URL}/robots.txt): Web crawler index permissions and AI agent guidance.
- [OpenSearch Specification](${SITE_URL}/opensearch.xml): Browser auto-discovery search provider definition.

## Technical Architecture & Key Facts
- **Platform Name**: Yozora (夜空 — Japanese for "Night Sky")
- **Official URL**: ${SITE_URL}
- **Framework**: TanStack Start, React 19, Vite, Nitro SSR, Tailwind CSS v4, Base UI
- **Data Integrations**: AniList GraphQL API (primary), Jikan v4 REST API (failover), AnimeThemes.moe (themes)
- **Caching**: L1 in-memory single-flight Map + L2 Upstash Redis via REST (fail-open design)
- **Authentication**: Clerk with SSR middleware and neon PostgreSQL database
- **Telemetry**: Zero third-party tracker scripts. Complete user privacy.
- **Repository**: https://github.com/shiinasaku/yozora
`

        return new Response(content, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=0, s-maxage=86400",
          },
        })
      },
    },
  },
})
