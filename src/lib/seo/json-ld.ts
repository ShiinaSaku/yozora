import type {
  AiringScheduleItem,
  Anime,
  AnimeCharacter,
  AnimeTheme,
  CharacterDetail,
} from "@/lib/types/anime"
import { SITE_URL } from "@/lib/seo/meta"

/**
 * Serializes a JSON-LD payload for embedding in a <script type="application/ld+json">
 * tag. Escapes `<` so upstream text containing `</script>` or `<!--` cannot
 * terminate the script block and corrupt the page.
 */
export function stringifyJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

/**
 * Strips HTML tags and excessive whitespace for clean SEO schema descriptions.
 */
function cleanText(text?: string): string {
  if (!text) return ""
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Generates Schema.org TVSeries or Movie JSON-LD structured data for Google Rich Results.
 */
export function generateAnimeJsonLd(
  anime: Anime,
  themes: AnimeTheme[] = [],
  characters: AnimeCharacter[] = []
) {
  const isMovie = anime.format === "MOVIE"
  const cleanDescription =
    cleanText(anime.description) ||
    `Watch, track, and listen to OSTs for ${anime.title} on Yozora.`
  const canonicalUrl = `${SITE_URL}/anime/${anime.id}`

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": isMovie ? "Movie" : "TVSeries",
    "@id": `${canonicalUrl}#schema`,
    name: anime.title,
    alternateName: [
      anime.titles?.english,
      anime.titles?.romaji,
      anime.titles?.native,
      anime.subtitle,
    ].filter(Boolean),
    description: cleanDescription,
    image: anime.coverExtraLarge || anime.coverLarge || anime.cover,
    thumbnailUrl: anime.coverMedium || anime.cover,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    sameAs: [
      `https://anilist.co/anime/${anime.id}`,
      anime.idMal
        ? `https://myanimelist.net/anime/${anime.idMal}`
        : `https://myanimelist.net/anime/${anime.id}`,
    ].filter(Boolean),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#anime-synopsis", "#airing-countdown"],
    },
    genre: anime.tags.length ? anime.tags : ["Animation", "Anime"],
    keywords: [
      anime.title,
      anime.titles?.english,
      anime.titles?.romaji,
      anime.titles?.native,
      anime.subtitle,
      ...anime.tags,
      ...(anime.studios || []).map((s) => `${s} anime`),
      "anime",
      "watch anime",
      "anime countdown",
      "broadcast schedule",
      "soundtracks",
      "themes",
      "episodes",
    ]
      .filter(Boolean)
      .join(", "),
    potentialAction: [
      {
        "@type": "WatchAction",
        target: canonicalUrl,
      },
      ...(themes.length > 0
        ? [
            {
              "@type": "ListenAction",
              target: `${canonicalUrl}#themes`,
            },
          ]
        : []),
    ],
  }

  if (anime.banner) {
    schema.thumbnailUrl = anime.banner
  }

  if (anime.year) {
    schema.datePublished = String(anime.year)
  }

  if (!isMovie && anime.episodes) {
    schema.numberOfEpisodes = anime.episodes
  }

  // Google Rich Results Gold Star Snippets
  if (anime.score && anime.score > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: anime.score.toFixed(1),
      bestRating: "10",
      worstRating: "0",
      ratingCount: Math.max(anime.favourites || 0, anime.popularity || 100),
    }
  }

  // Production Studios
  if (anime.studios?.length) {
    schema.productionCompany = anime.studios.map((name) => ({
      "@type": "Organization",
      name: name,
    }))
  }

  if (anime.trailer?.id) {
    schema.trailer = {
      "@type": "VideoObject",
      name: `${anime.title} Official Trailer`,
      description: `Official trailer for ${anime.title}`,
      thumbnailUrl: anime.cover,
      embedUrl: `https://www.youtube.com/embed/${anime.trailer.id}`,
    }
  }

  // Characters & Voice Cast Roles (GEO & AEO)
  if (characters.length > 0) {
    schema.character = characters.slice(0, 10).map((c) => ({
      "@type": "Person",
      name: c.name,
      image: c.image,
    }))
    schema.actor = characters
      .filter((c) => c.voiceActor?.name)
      .slice(0, 8)
      .map((c) => ({
        "@type": "PerformanceRole",
        characterName: c.name,
        actor: {
          "@type": "Person",
          name: c.voiceActor!.name,
          image: c.voiceActor?.image,
        },
      }))
  }

  // Soundtracks / Themes
  if (themes.length > 0) {
    schema.soundtrack = {
      "@type": "MusicPlaylist",
      name: `${anime.title} Official Soundtracks & Themes`,
      numTracks: themes.length,
      track: themes.map((t) => ({
        "@type": "MusicRecording",
        name: t.title,
        byArtist: {
          "@type": "MusicGroup",
          name: t.artists.join(", ") || "Various Artists",
        },
      })),
    }
  }

  return schema
}

/**
 * Generates Schema.org Person JSON-LD for Anime Characters.
 */
export function generateCharacterJsonLd(char: CharacterDetail) {
  const canonicalUrl = `${SITE_URL}/character/${char.id}`
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${canonicalUrl}#schema`,
    name: char.name.full || "Anime Character",
    alternateName: [char.name.native, ...(char.name.alternative || [])].filter(
      Boolean
    ),
    description:
      cleanText(char.description) ||
      `Anime character profile for ${char.name.full || "Character"}.`,
    image: char.image,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    jobTitle: "Anime Character",
    sameAs: [
      `https://anilist.co/character/${char.id}`,
      `https://myanimelist.net/character/${char.id}`,
    ],
    performerIn: char.media.slice(0, 8).map((m) => ({
      "@type": m.format === "MOVIE" ? "Movie" : "TVSeries",
      name: m.title,
      url: `${SITE_URL}/anime/${m.id}`,
    })),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  }
}

/**
 * Generates Schema.org FAQPage JSON-LD for anime detail pages (AEO & GEO).
 * Powers Google AI Overviews, rich answer cards, and Perplexity factual citations.
 */
export function generateAnimeFaqJsonLd(
  anime: Anime,
  themes: AnimeTheme[] = [],
  characters: AnimeCharacter[] = []
) {
  const faqs: { question: string; answer: string }[] = []

  // 1. Airing schedule & episodes
  if (anime.nextAiring) {
    const airDate = new Date(anime.nextAiring.airingAt * 1000).toUTCString()
    faqs.push({
      question: `When does ${anime.title} Episode ${anime.nextAiring.episode} air?`,
      answer: `${anime.title} Episode ${anime.nextAiring.episode} is scheduled to broadcast on Japanese television on ${airDate}. Track real-time countdowns on Yozora.`,
    })
  } else if (anime.status) {
    faqs.push({
      question: `Is ${anime.title} currently airing or finished?`,
      answer: `${anime.title} has a broadcast status of ${anime.status}${anime.episodes ? ` with ${anime.episodes} total episodes` : ""}${anime.year ? ` originally released in ${anime.year}` : ""}.`,
    })
  }

  // 2. Plot synopsis
  if (anime.description) {
    const cleanDesc = cleanText(anime.description)
    faqs.push({
      question: `What is the synopsis of ${anime.title}?`,
      answer:
        cleanDesc.length > 280 ? `${cleanDesc.slice(0, 277)}...` : cleanDesc,
    })
  }

  // 3. Opening & Ending theme songs
  if (themes.length > 0) {
    const op = themes.find((t) => t.type === "OP")
    const ed = themes.find((t) => t.type === "ED")
    const songs: string[] = []
    if (op)
      songs.push(
        `Opening Theme (OP): "${op.title}" by ${op.artists.join(", ") || "Various Artists"}`
      )
    if (ed)
      songs.push(
        `Ending Theme (ED): "${ed.title}" by ${ed.artists.join(", ") || "Various Artists"}`
      )

    faqs.push({
      question: `What are the opening and ending theme songs for ${anime.title}?`,
      answer:
        songs.join(". ") ||
        `Creditless OP/ED theme songs for ${anime.title} are available in lossless 1080p on Yozora.`,
    })
  }

  // 4. Voice cast & Seiyuu
  const cast = characters.filter((c) => c.voiceActor?.name).slice(0, 5)
  if (cast.length > 0) {
    const castString = cast
      .map((c) => `${c.name} (${c.voiceActor!.name})`)
      .join(", ")
    faqs.push({
      question: `Who are the Japanese voice actors (seiyuu) for ${anime.title}?`,
      answer: `The voice cast for ${anime.title} includes: ${castString}.`,
    })
  }

  // 5. Studio
  if (anime.studios && anime.studios.length > 0) {
    faqs.push({
      question: `Which animation studio produced ${anime.title}?`,
      answer: `${anime.title} was animated and produced by studio ${anime.studios.join(", ")}.`,
    })
  }

  return generateFaqJsonLd(faqs)
}

/**
 * Generates Schema.org FAQPage JSON-LD for character profiles (AEO & GEO).
 */
export function generateCharacterFaqJsonLd(char: CharacterDetail) {
  const faqs: { question: string; answer: string }[] = []

  faqs.push({
    question: `Who is ${char.name.full} in anime?`,
    answer:
      cleanText(char.description) ||
      `${char.name.full} is a featured anime character profiled on Yozora with voice actor and role data.`,
  })

  if (char.name.native) {
    faqs.push({
      question: `What is ${char.name.full}'s Japanese native name?`,
      answer: `${char.name.full}'s native name in Japanese is ${char.name.native}${char.name.alternative?.length ? ` (also known as ${char.name.alternative.join(", ")})` : ""}.`,
    })
  }

  if (char.media.length > 0) {
    const seriesList = char.media
      .slice(0, 5)
      .map((m) => m.title)
      .join(", ")
    faqs.push({
      question: `What anime series does ${char.name.full} appear in?`,
      answer: `${char.name.full} appears in: ${seriesList}.`,
    })
  }

  return generateFaqJsonLd(faqs)
}

/**
 * Generates Yozora publisher identity and logo markup for search engines and LLMs.
 */
export function generateOrganizationJsonLd() {
  const logoUrl = `${SITE_URL}/yozora-icon-512.png`

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Yozora",
    alternateName: [
      "Yozora Anime",
      "Yozora Platform",
      "Yozora moe",
      "yozora.moe",
      "Anime Yozora",
      "Yozora Database",
      "Yozora Radar",
      "夜空",
    ],
    url: SITE_URL,
    description:
      "Television broadcast scheduling radar, seasonal anime cour archives, creditless opening and ending theme playback, and synchronized library tracking for global audiences.",
    disambiguatingDescription:
      "Yozora (夜空) is an anime discovery and broadcast radar platform featuring live episode countdowns, seasonal cour charts, 1080p creditless anime music, and personal watchlist tracking.",
    knowsAbout: [
      "Anime",
      "Japanese Animation",
      "Seasonal Anime",
      "Anime Broadcast Schedules",
      "Episode Airing Countdowns",
      "Creditless Anime Themes",
      "Anime Soundtracks (OST)",
      "Anime Openings and Endings",
      "Voice Actors (Seiyuu)",
      "AniList",
      "MyAnimeList",
    ],
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      contentUrl: logoUrl,
      width: 512,
      height: 512,
      caption: "Yozora",
    },
    image: logoUrl,
  }
}
/**
 * Generates Schema.org WebSite JSON-LD with Sitelinks Searchbox action.
 */
export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Yozora",
    alternateName: [
      "Yozora Anime",
      "Yozora Database",
      "Yozora Radar",
      "Yozora moe",
      "yozora.moe",
      "Anime Yozora",
      "夜空",
    ],
    description:
      "Comprehensive anime broadcast scheduling, seasonal release archives, creditless theme playback, and synchronized personal watchlists.",
    inLanguage: ["en", "ja"],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * Generates Schema.org FAQPage JSON-LD for AI search engines & rich snippets (GEO best practice).
 */
export function generateFaqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD.
 */
export function generateBreadcrumbsJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_URL}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  }
}

/**
 * Generates Schema.org WebApplication JSON-LD for Answer Engines (AEO).
 */
export function generateSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#app`,
    name: "Yozora",
    alternateName: ["Yozora Anime", "夜空"],
    url: SITE_URL,
    description:
      "Real-time anime broadcast schedule radar, seasonal cour charts, and 1080p creditless theme player.",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "All modern web browsers",
    browserRequirements: "Requires JavaScript and WebM/MP4 HTML5 video support",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Millisecond-accurate Tokyo broadcast countdowns",
      "Dual-engine AniList and Jikan failover architecture",
      "1080p clean opening and ending music playback via AnimeThemes.moe",
      "Personal watchlist and episode progress synchronization",
      "Two-tier caching with sub-millisecond response times",
    ],
    publisher: { "@id": `${SITE_URL}/#organization` },
  }
}

/**
 * Generates Schema.org Dataset JSON-LD for Generative Engines (GEO).
 */
export function generateDatasetJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/#dataset`,
    name: "Yozora Anime Broadcast & Theme Music Archive",
    description:
      "Comprehensive database of seasonal anime television schedules, countdown timetables, voice acting credits, and creditless soundtrack records.",
    url: SITE_URL,
    license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    isAccessibleForFree: true,
    creator: { "@id": `${SITE_URL}/#organization` },
    keywords: [
      "anime",
      "broadcast schedule",
      "airing countdown",
      "soundtracks",
      "openings",
      "endings",
      "AniList",
      "Jikan",
    ],
  }
}

/**
 * Generates Schema.org ItemList with BroadcastEvent items for Airing Radar (GEO & AEO).
 */
export function generateAiringScheduleJsonLd(items: AiringScheduleItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/airing#schedule`,
    name: "Tokyo Anime Television Broadcast Timetable",
    description:
      "Real-time episode airing schedule and countdowns for active Japanese television broadcasts.",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "BroadcastEvent",
        name: `${item.media.title} Episode ${item.episode}`,
        startDate: new Date(item.airingAt * 1000).toISOString(),
        url: `${SITE_URL}/anime/${item.media.id}`,
        workPresented: {
          "@type": "TVSeries",
          name: item.media.title,
          image: item.media.cover,
        },
      },
    })),
  }
}
