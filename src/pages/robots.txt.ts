import type { APIRoute } from "astro"
import { SITE_URL } from "@/lib/seo/meta"

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /library
Disallow: /settings/
Disallow: /sign-in
Disallow: /sign-up

# Sitemaps & Generative Engine Optimization (GEO)
Sitemap: ${SITE_URL}/sitemap.xml

# Machine-Readable Context for AI Agents
# LLM Context: ${SITE_URL}/llms.txt
# Full LLM Specification: ${SITE_URL}/llms-full.txt
# Pricing & Open Source License: ${SITE_URL}/pricing.md
# Google Open Knowledge Format: ${SITE_URL}/okf/index.md
`
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  })
}
