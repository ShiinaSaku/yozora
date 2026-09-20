import { createFileRoute } from "@tanstack/react-router"
import { SITE_URL } from "@/lib/seo/meta"

/**
 * Route definition for search engine robots.txt crawlers configuration.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /settings/
Disallow: /sign-in/
Disallow: /sign-up/

# Major Search Engine Crawlers
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

# Generative AI & Answer Engine Crawlers (AEO / GEO)
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

# Sitemaps & Generative Engine Optimization (GEO)
Sitemap: ${SITE_URL}/sitemap.xml
`
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=0, s-maxage=86400",
          },
        })
      },
    },
  },
})
