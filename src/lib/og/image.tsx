import fs from "node:fs"
import path from "node:path"
import { ImageResponse } from "takumi-js/response"
import * as React from "react"
import { YOZORA_EYE_LOGO_BASE64 } from "@/lib/og/brand-asset"
import { parseOgParams, sanitizeAccent } from "@/lib/og/params"
import { fetchSafeImageDataUri } from "@/lib/og/safe-image"
import type { OgParams } from "@/lib/og/params"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630
const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

const DISPLAY_FONT = "Inter, sans-serif"
const JP_FONT = "'Zen Maru Gothic', sans-serif"
const MONO_FONT = "monospace"

const INK = "#1c1a19"
const MUTED = "#66615e"
const FAINT = "#918b86"
const HAIRLINE = "rgba(38, 34, 31, 0.14)"
const PANEL = "#f5f4f1"

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
        fonts.push({
          name: "Inter",
          data: interData,
          weight: 700,
          style: "normal",
        })
        fonts.push({
          name: "Inter",
          data: interData,
          weight: 400,
          style: "normal",
        })
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

/** Brand accent color with alpha, for glows and highlights. */
function accent(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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
  avatar = false,
}: {
  imageDataUri: string
  color: string
  avatar?: boolean
}) {
  return (
    <div
      style={{
        width: avatar ? 220 : 300,
        height: avatar ? 220 : 450,
        flexShrink: 0,
        borderRadius: avatar ? 9999 : 20,
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
            gap: 10,
            fontFamily: MONO_FONT,
            fontSize: 11,
            color: INK,
          }}
        >
          {features.map((feature) => (
            <span
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 11px",
                borderRadius: 9999,
                border: `1px solid ${HAIRLINE}`,
                backgroundColor: "rgba(255, 255, 255, 0.035)",
                color: MUTED,
              }}
            >
              {feature}
            </span>
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
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontFamily: MONO_FONT,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: params.accent,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 9999,
            backgroundColor: params.accent,
            boxShadow: `0 0 16px ${accent(params.accent, 0.75)}`,
          }}
        />
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
            {(params.score || index > 0) && (
              <span style={{ color: FAINT }}>·</span>
            )}
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
function OgCard({
  params,
  imageDataUri,
}: {
  params: OgParams
  imageDataUri: string
}) {
  const isMedia = params.type === "anime" || params.type === "character"
  const isUser = params.type === "user"
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: PANEL,
        backgroundImage:
          "radial-gradient(ellipse at center, #faf9f7 0%, #f3f2ef 72%, #efeeeb 100%)",
        color: INK,
        fontFamily: DISPLAY_FONT,
        display: "flex",
        flexDirection: "column",
        justifyContent: isMedia || isUser ? "space-between" : "center",
        alignItems: isMedia || isUser ? "stretch" : "center",
        padding: isMedia || isUser ? "56px 76px" : "48px 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        aria-hidden="true"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
        style={{ position: "absolute", inset: 0, opacity: 0.72 }}
      >
        {Array.from({ length: 27 }, (_, contour) => {
          const radius = 180 + contour * 19
          const amplitude = 2 + contour * 0.34
          const contourPath = Array.from({ length: 181 }, (_value, point) => {
            const angle = (point / 180) * Math.PI * 2
            const wave = Math.sin(angle * 8) * amplitude
            const x = CARD_WIDTH / 2 + (radius + wave) * 1.7 * Math.cos(angle)
            const y = CARD_HEIGHT / 2 + (radius + wave) * Math.sin(angle)
            return `${point === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
          }).join(" ")
          return (
            <path
              key={contour}
              d={`${contourPath} Z`}
              fill="none"
              stroke="#817b76"
              strokeWidth="1"
              opacity={contour % 4 === 0 ? 0.4 : 0.27}
            />
          )
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CARD_HEIGHT / 2,
          height: 1,
          backgroundColor: "rgba(45, 41, 37, 0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: CARD_WIDTH / 2,
          width: 1,
          backgroundColor: "rgba(45, 41, 37, 0.11)",
        }}
      />
      {isMedia || isUser ? (
        <div style={{ position: "relative", display: "flex" }}>
          <CardHeader
            tag={params.tag || params.type.toUpperCase()}
            color={params.accent}
          />
        </div>
      ) : null}

      {isMedia || isUser ? (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 48,
            width: "100%",
          }}
        >
          <MediaImage
            imageDataUri={imageDataUri}
            color={params.accent}
            avatar={isUser}
          />
          {isUser ? (
            <EditorialBody params={params} />
          ) : (
            <MediaBody params={params} />
          )}
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: titleSize(params.title.length, 96, 64),
              fontWeight: 700,
              letterSpacing: "-0.055em",
              lineHeight: 1,
              color: INK,
            }}
          >
            {params.title}
          </div>
        </div>
      )}

      {isMedia || isUser ? (
        <div style={{ position: "relative" }}>
          <CardFooter color={params.accent} />
        </div>
      ) : null}
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
  <rect width="1200" height="630" fill="#f5f4f1"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <line x1="0" y1="315" x2="1200" y2="315" stroke="#bcb7b2" stroke-opacity="0.45"/>
  <line x1="600" y1="0" x2="600" y2="630" stroke="#bcb7b2" stroke-opacity="0.35"/>
  <text x="600" y="340" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="76" fill="#1c1a19" letter-spacing="-3">${esc(title)}</text>
  <text x="600" y="385" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#66615e">${esc(description)}</text>
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
      params.type === "anime" ||
      params.type === "character" ||
      params.type === "user"
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
