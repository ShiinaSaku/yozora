import fs from "node:fs"
import path from "node:path"
import { Buffer } from "node:buffer"
import { ImageResponse } from "takumi-js/response"
import * as React from "react"
import { YOZORA_EYE_LOGO_BASE64 } from "@/lib/og/brand-asset"
import { parseOgParams, sanitizeAccent } from "@/lib/og/params"
import type { OgParams } from "@/lib/og/params"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630
const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

const DISPLAY_FONT = "Inter, sans-serif"
const JP_FONT = "'Zen Maru Gothic', sans-serif"
const MONO_FONT = "monospace"

const INK = "#f4f4f5"
const MUTED = "#9d9da8"
const FAINT = "#5c5c68"
const HAIRLINE = "rgba(255, 255, 255, 0.08)"
const PANEL = "#08070f"

type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 700
  style: "normal"
}

let fontsPromise: Promise<OgFont[]> | null = null

async function loadFontBuffer(
  localRelativePath: string,
  remoteUrl: string,
  timeoutMs = 4500
): Promise<ArrayBuffer | null> {
  try {
    const fullPath = path.resolve(process.cwd(), localRelativePath)
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath)
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
  } catch {
    // Filesystem read failed, fall through to remote fetch
  }

  try {
    const res = await fetch(remoteUrl, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

function loadOgFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const [interData, zenData] = await Promise.all([
        loadFontBuffer(
          "src/lib/og/fonts/Inter.ttf",
          "https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf"
        ),
        loadFontBuffer(
          "src/lib/og/fonts/ZenMaruGothic-Bold.ttf",
          "https://github.com/google/fonts/raw/main/ofl/zenmarugothic/ZenMaruGothic-Bold.ttf"
        ),
      ])

      const fonts: OgFont[] = []
      if (interData) {
        fonts.push({ name: "Inter", data: interData, weight: 700, style: "normal" })
        fonts.push({ name: "Inter", data: interData, weight: 400, style: "normal" })
      }
      if (zenData) {
        fonts.push({
          name: "Zen Maru Gothic",
          data: zenData,
          weight: 700,
          style: "normal",
        })
      }
      return fonts
    })()
  }
  return fontsPromise
}

function isAllowedImageHost(hostname: string): boolean {
  return (
    hostname === "s4.anilist.co" ||
    hostname === "anilist.co" ||
    hostname.endsWith(".anilist.co") ||
    hostname === "cdn.myanimelist.net" ||
    hostname.endsWith(".myanimelist.net") ||
    hostname === "img.clerk.com" ||
    hostname.endsWith(".clerk.com") ||
    hostname === "animethemes.moe" ||
    hostname.endsWith(".animethemes.moe")
  )
}

async function fetchSafeImageDataUri(url: string | null): Promise<string> {
  if (!url) return ""

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" || !isAllowedImageHost(parsed.hostname)) {
      return ""
    }

    const res = await fetch(parsed.toString(), {
      redirect: "manual",
      headers: { "user-agent": "Mozilla/5.0 (compatible; YozoraBot/1.0)" },
      signal: AbortSignal.timeout(3500),
    })
    // Edge runtimes reject `redirect: "error"`; rejects redirects manually.
    if (!res.ok || (res.status >= 300 && res.status < 400)) {
      return ""
    }

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await res.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    return `data:${contentType};base64,${base64}`
  } catch {
    return ""
  }
}

/** Brand accent color with alpha, for glows and highlights. */
function accent(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Deterministic starfield so every render is identical. */
const STARS = (() => {
  let seed = 0x2f6ea2
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
  return Array.from({ length: 32 }, () => ({
    left: Math.round(rand() * 1150),
    top: Math.round(rand() * 580),
    size: rand() < 0.85 ? 2 : 3,
    opacity: Number((0.06 + rand() * 0.28).toFixed(2)),
  }))
})()

function titleSize(length: number, base: number, floor: number): number {
  if (length > 80) return Math.round(base * 0.68)
  if (length > 50) return Math.round(base * 0.8)
  if (length > 32) return Math.round(base * 0.9)
  return Math.max(base, floor)
}

const EDITORIAL_FEATURES: Record<string, string[]> = {
  home: ["Real-time airing grid", "Lossless theme archive", "Open data"],
  seasonal: ["Seasonal charts", "Broadcast timetables", "Creditless themes"],
  airing: ["7-day airing grid", "Live countdowns", "JST network sync"],
  library: ["Watchlist tracker", "Episode progress", "Personal ratings"],
  about: ["Zero ads & trackers", "AniList open data", "Community first"],
}

function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: "#0e0d18",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        <img
          src={YOZORA_EYE_LOGO_BASE64}
          alt="Yozora"
          width={30}
          height={30}
          style={{ objectFit: "contain" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: INK,
          }}
        >
          Yozora
        </span>
        <span
          style={{
            fontFamily: JP_FONT,
            fontSize: 13,
            fontWeight: 700,
            color: FAINT,
          }}
        >
          夜空
        </span>
      </div>
    </div>
  )
}

function CardHeader({ tag, color }: { tag: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <BrandMark />
      {tag ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              backgroundColor: color,
            }}
          />
          <span
            style={{
              fontFamily: MONO_FONT,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            {tag}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function CardFooter({ color }: { color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${HAIRLINE}`,
        paddingTop: 18,
        width: "100%",
      }}
    >
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 11,
          letterSpacing: "0.04em",
          color: FAINT,
        }}
      >
        open anime intelligence · 1080p themes
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: MONO_FONT,
          fontSize: 12,
          fontWeight: 600,
          color,
        }}
      >
        yozora.moe
        <span style={{ color: INK }}>↗</span>
      </span>
    </div>
  )
}

function MediaImage({
  imageDataUri,
  color,
}: {
  imageDataUri: string
  color: string
}) {
  return (
    <div
      style={{
        width: 300,
        height: 450,
        flexShrink: 0,
        borderRadius: 20,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        overflow: "hidden",
        boxShadow: "0 30px 70px -20px rgba(0, 0, 0, 0.9)",
        position: "relative",
        display: "flex",
      }}
    >
      {imageDataUri ? (
        <img
          src={imageDataUri}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(180deg, ${accent(color, 0.16)}, rgba(0, 0, 0, 0))`,
            backgroundColor: "#0d0c18",
          }}
        >
          <img
            src={YOZORA_EYE_LOGO_BASE64}
            alt=""
            width={64}
            height={64}
            style={{ opacity: 0.35 }}
          />
        </div>
      )}
    </div>
  )
}

function EditorialBody({ params }: { params: OgParams }) {
  const features = EDITORIAL_FEATURES[params.type] ?? []
  const eyebrow = params.subtitle || params.tag || "Open anime intelligence"
  const size = titleSize(params.title.length, 84, 84)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: "100%",
        maxWidth: 960,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: MONO_FONT,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: MUTED,
        }}
      >
        <span style={{ color: params.accent }}>//</span>
        {eyebrow}
      </div>

      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          color: INK,
          overflow: "hidden",
          maxHeight: 190,
        }}
      >
        {params.title}
      </div>

      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 19,
          color: MUTED,
          lineHeight: 1.5,
          overflow: "hidden",
          maxHeight: 60,
        }}
      >
        {params.description}
      </div>

      {features.length > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: MONO_FONT,
            fontSize: 12,
            color: FAINT,
          }}
        >
          {features.map((feature, index) => (
            <React.Fragment key={feature}>
              {index > 0 && <span style={{ color: FAINT }}>·</span>}
              <span>{feature}</span>
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MediaBody({ params }: { params: OgParams }) {
  const size = titleSize(params.title.length, 62, 48)
  const meta = [
    params.year,
    params.format,
    params.episodes ? `${params.episodes} episodes` : "",
  ].filter(Boolean)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: params.accent,
        }}
      >
        {params.tag || "Anime showcase"}
      </div>

      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.08,
          color: INK,
          overflow: "hidden",
          maxHeight: 150,
        }}
      >
        {params.title}
      </div>

      {params.native ? (
        <div
          style={{
            fontFamily: JP_FONT,
            fontSize: 17,
            fontWeight: 700,
            color: MUTED,
            overflow: "hidden",
            maxHeight: 26,
          }}
        >
          {params.native}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: MONO_FONT,
          fontSize: 13,
          color: MUTED,
        }}
      >
        {params.score ? (
          <span style={{ color: params.accent, fontWeight: 700 }}>
            ★ {params.score}
          </span>
        ) : null}
        {meta.map((item, index) => (
          <React.Fragment key={item}>
            {(params.score || index > 0) && <span style={{ color: FAINT }}>·</span>}
            <span>{item}</span>
          </React.Fragment>
        ))}
      </div>

      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 16,
          color: MUTED,
          lineHeight: 1.5,
          overflow: "hidden",
          maxHeight: 72,
        }}
      >
        {params.description}
      </div>

      {params.genres.length > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: FAINT,
          }}
        >
          {params.genres.join(" · ")}
        </div>
      ) : null}
    </div>
  )
}

/** The one card layout every OG image shares. */
function OgCard({ params, imageDataUri }: { params: OgParams; imageDataUri: string }) {
  const isMedia = params.type === "anime" || params.type === "character"
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: PANEL,
        color: INK,
        fontFamily: DISPLAY_FONT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 64px 44px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent glow */}
      <div
        style={{
          position: "absolute",
          top: -320,
          left: 300,
          width: 900,
          height: 700,
          borderRadius: 9999,
          backgroundImage: `radial-gradient(ellipse at 50% 0%, ${accent(params.accent, 0.14)} 0%, transparent 70%)`,
        }}
      />

      {/* Starfield */}
      <div style={{ position: "absolute", inset: 0 }}>
        {STARS.map((star, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: 9999,
              backgroundColor: "#ffffff",
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <CardHeader
          tag={params.tag || params.type.toUpperCase()}
          color={params.accent}
        />
      </div>

      {isMedia ? (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 48,
            width: "100%",
          }}
        >
          <MediaImage imageDataUri={imageDataUri} color={params.accent} />
          <MediaBody params={params} />
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <EditorialBody params={params} />
        </div>
      )}

      <div style={{ position: "relative" }}>
        <CardFooter color={params.accent} />
      </div>
    </div>
  )
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Static SVG fallback used when the renderer itself fails. */
function generateSvgFallback(title: string, description: string) {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="55%" cy="0%" r="65%">
      <stop offset="0%" stop-color="#8b7cb8" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#8b7cb8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#08070f"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="64" y="96" font-family="sans-serif" font-weight="700" font-size="22" fill="#f4f4f5" letter-spacing="-0.5">Yozora</text>
  <text x="150" y="96" font-family="sans-serif" font-weight="700" font-size="14" fill="#5c5c68">夜空</text>
  <text x="64" y="320" font-family="sans-serif" font-weight="700" font-size="56" fill="#f4f4f5" letter-spacing="-1">${esc(title)}</text>
  <text x="64" y="368" font-family="sans-serif" font-size="19" fill="#9d9da8">${esc(description)}</text>
  <line x1="64" y1="540" x2="1136" y2="540" stroke="rgba(255,255,255,0.08)"/>
  <text x="64" y="572" font-family="monospace" font-size="12" fill="#5c5c68">open anime intelligence · 1080p themes</text>
  <text x="1064" y="572" font-family="monospace" font-weight="600" font-size="12" fill="#8b7cb8">yozora.moe ↗</text>
</svg>`
}

/** Handles OpenGraph social card generation in the Yozora night-sky design. */
export async function handleOgImageRequest({ request }: { request: Request }) {
  // Serve repeat crawler hits straight from the platform cache: rendering these
  // cards is CPU-heavy, and Cloudflare only stops the Worker once per card
  // instead of on every scrape.
  const edgeCache = (
    globalThis as { caches?: CacheStorage & { default?: Cache } }
  ).caches?.default
  if (edgeCache) {
    try {
      const hit = await edgeCache.match(request)
      if (hit) return hit
    } catch {
      // Cache read failure should never block rendering.
    }
  }

  try {
    const url = new URL(request.url)
    const params = parseOgParams(url.searchParams)

    const imageDataUri =
      params.type === "anime" || params.type === "character"
        ? await fetchSafeImageDataUri(params.image)
        : ""

    const fonts = await loadOgFonts()

    const options: {
      width: number
      height: number
      headers: Record<string, string>
      fonts?: OgFont[]
    } = {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      headers: {
        "cache-control": CACHE_CONTROL,
        "content-type": "image/png",
        "x-content-type-options": "nosniff",
      },
    }
    if (fonts.length > 0) {
      options.fonts = fonts
    }

    const response = new ImageResponse(
      <OgCard params={params} imageDataUri={imageDataUri} />,
      options
    )
    if (edgeCache) {
      try {
        await edgeCache.put(request, response.clone())
      } catch {
        // Cache write failure should never block serving the image.
      }
    }
    return response
  } catch (err) {
    console.error("[OG Image Error]:", err)
    const fallbackSvg = generateSvgFallback(
      "Yozora",
      "Open anime intelligence & 1080p themes"
    )
    return new Response(fallbackSvg, {
      headers: {
        "content-type": "image/svg+xml",
        "cache-control": "no-store",
      },
    })
  }
}

export { sanitizeAccent }
