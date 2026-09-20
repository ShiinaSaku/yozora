import { createFileRoute } from "@tanstack/react-router"
import { catalogCollections, getAnimeCollection } from "@/lib/catalog"
import { SITE_URL } from "@/lib/seo/meta"
import type { Anime } from "@/lib/types/anime"

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char]!
  )
}

function staticUrl(path: string, changeFrequency: string, priority: string) {
  return `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc><changefreq>${changeFrequency}</changefreq><priority>${priority}</priority></url>`
}

function animeUrl(anime: Anime) {
  const location = `${SITE_URL}/anime/${anime.id}`
  const image = anime.coverExtraLarge || anime.coverLarge || anime.cover
  const imageMarkup = image
    ? `<image:image><image:loc>${escapeXml(image)}</image:loc><image:title>${escapeXml(anime.title)}</image:title><image:caption>${escapeXml(`${anime.title} anime cover on Yozora`)}</image:caption></image:image>`
    : ""

  return `<url><loc>${escapeXml(location)}</loc><changefreq>weekly</changefreq><priority>0.8</priority>${imageMarkup}</url>`
}

/** Dynamic XML sitemap covering Yozora discovery pages and active AniList catalog titles. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const collections = await Promise.all(
          catalogCollections.map((collection) =>
            getAnimeCollection(collection).catch(() => [])
          )
        )
        const animeById = new Map<number, Anime>()
        for (const anime of collections.flat()) {
          animeById.set(anime.id, anime)
        }

        const staticEntries = [
          staticUrl("/", "daily", "1.0"),
          staticUrl("/seasonal", "daily", "0.9"),
          staticUrl("/airing", "hourly", "0.9"),
          staticUrl("/about", "monthly", "0.5"),
          staticUrl("/privacy", "yearly", "0.2"),
        ]
        const entries = [
          ...staticEntries,
          ...[...animeById.values()].map(animeUrl),
        ]
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join("")}</urlset>`

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control":
              "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
            "x-content-type-options": "nosniff",
          },
        })
      },
    },
  },
})
