import fs from "node:fs"
import path from "node:path"
import { Buffer } from "node:buffer"
import { ImageResponse } from "takumi-js/response"
import { YOZORA_EYE_LOGO_BASE64 } from "@/lib/og/brand-asset"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630
const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

const DISPLAY_FONT = "Inter, sans-serif"
const JP_FONT = "'Zen Maru Gothic', sans-serif"
/** Font loader for OG canvas rendering. */

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
  // 1. Attempt fast local filesystem read
  try {
    const fullPath = path.resolve(process.cwd(), localRelativePath)
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath)
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
  } catch {
    // Filesystem read failed, fall through to remote fetch
  }

  // 2. Fallback to remote CDN fetch
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

function textParam(
  searchParams: URLSearchParams,
  name: string,
  fallback: string,
  maxLength: number
) {
  return (searchParams.get(name)?.trim() || fallback).slice(0, maxLength)
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
      redirect: "error",
      headers: { "user-agent": "Mozilla/5.0 (compatible; YozoraBot/1.0)" },
      signal: AbortSignal.timeout(3500),
    })
    if (!res.ok) return ""

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await res.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    return `data:${contentType};base64,${base64}`
  } catch {
    return ""
  }
}

function safeAccent(value: string, fallback = "#38bdf8"): string {
  return /^#[\da-f]{6}$/i.test(value) ? value : fallback
}

function titleFontSize(title: string, base = 56): number {
  const len = title.length
  if (len > 80) return Math.round(base * 0.65)
  if (len > 50) return Math.round(base * 0.76)
  if (len > 32) return Math.round(base * 0.88)
  return base
}

function BrandHeader({ tag, live = false }: { tag: string; live?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        zIndex: 10,
      }}
    >
      {/* Brand logo + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img
          src={YOZORA_EYE_LOGO_BASE64}
          alt="Yozora"
          width={40}
          height={40}
          style={{ objectFit: "contain" }}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            YOZORA
          </span>
          <span
            style={{
              fontFamily: JP_FONT,
              fontSize: 15,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            夜空
          </span>
        </div>
      </div>

      {/* Tag badge */}
      {tag ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e2e8f0",
            fontFamily: DISPLAY_FONT,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {live ? (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                backgroundColor: "#10b981",
              }}
            />
          ) : null}
          {tag}
        </div>
      ) : null}
    </div>
  )
}

function EditorialCard({
  type,
  title,
  subtitle,
  description,
  tag,
  accent,
  pills = [],
}: {
  type: string
  title: string
  subtitle?: string
  description: string
  tag: string
  accent: string
  pills?: string[]
}) {
  const isAiring = type === "airing"
  const isHome = type === "home"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#07080e",
        color: "#ffffff",
        fontFamily: DISPLAY_FONT,
        padding: "54px 68px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -100,
          width: 650,
          height: 650,
          borderRadius: 999,
          backgroundImage: `radial-gradient(circle, ${accent}22 0%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -100,
          width: 550,
          height: 550,
          borderRadius: 999,
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Top Header */}
      <BrandHeader tag={tag} live={isAiring || isHome} />

      {/* Hero content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 960,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: accent,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 24,
              height: 3,
              borderRadius: 99,
              backgroundColor: accent,
            }}
          />
          {subtitle || "The Modern Anime Discovery Platform"}
        </div>

        <div
          style={{
            fontSize: titleFontSize(title, 56),
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: "#ffffff",
            overflow: "hidden",
            maxHeight: 180,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 20,
            color: "#94a3b8",
            lineHeight: 1.45,
            fontWeight: 400,
            overflow: "hidden",
            maxHeight: 62,
          }}
        >
          {description}
        </div>

        {/* Feature Pills */}
        {pills.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 6,
            }}
          >
            {pills.map((pill) => (
              <div
                key={pill}
                style={{
                  padding: "7px 15px",
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {pill}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#64748b",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span>yozora.moe</span>
          <span>•</span>
          <span>seasonal anime intelligence</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: accent,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          yozora.moe →
        </div>
      </div>
    </div>
  )
}

function AnimeCard({
  title,
  subtitle,
  nativeTitle,
  description,
  tag,
  genres,
  score,
  imageDataUri,
  year,
  format,
  episodes,
  accent,
}: {
  title: string
  subtitle: string
  nativeTitle: string
  description: string
  tag: string
  genres: string
  score: string
  imageDataUri: string
  year: string
  format: string
  episodes: string
  accent: string
}) {
  const genreList = genres
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3)

  const size = titleFontSize(title, 52)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#07080e",
        color: "#ffffff",
        fontFamily: DISPLAY_FONT,
        position: "relative",
        overflow: "hidden",
        padding: "52px 64px",
      }}
    >
      {/* Ambient background cover blur */}
      {imageDataUri ? (
        <img
          src={imageDataUri}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.12,
          }}
        />
      ) : null}

      {/* Deep gradient scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(90deg, rgba(7,8,14,0.98) 0%, rgba(7,8,14,0.92) 58%, rgba(7,8,14,0.65) 100%)",
        }}
      />

      {/* Ambient color wash */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 600,
          height: 600,
          borderRadius: 999,
          backgroundImage: `radial-gradient(circle, ${accent}25 0%, transparent 68%)`,
        }}
      />

      {/* Left Column: Metadata & Typography */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          flex: 1,
          paddingRight: 48,
          zIndex: 10,
        }}
      >
        {/* Top: Brand mark + Format / Year / Episodes */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={YOZORA_EYE_LOGO_BASE64}
            alt="Yozora"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            YOZORA
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 18,
              margin: "0 4px",
            }}
          >
            /
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {format ? (
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: "rgba(56,189,248,0.14)",
                  border: "1px solid rgba(56,189,248,0.3)",
                  color: "#7dd3fc",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {format}
              </div>
            ) : null}
            {year ? (
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {year}
              </div>
            ) : null}
            {episodes ? (
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {episodes} EP
              </div>
            ) : null}
          </div>
        </div>

        {/* Center: Eyebrow + Titles + Synopsis + Genres */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              color: accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 18,
                height: 2.5,
                backgroundColor: accent,
                borderRadius: 99,
              }}
            />
            {tag || "Anime Showcase"}
          </div>

          <div
            style={{
              fontSize: size,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "#ffffff",
              overflow: "hidden",
              maxHeight: 155,
            }}
          >
            {title}
          </div>

          {nativeTitle || subtitle ? (
            <div
              style={{
                fontFamily: JP_FONT,
                fontSize: 18,
                fontWeight: 700,
                color: "#94a3b8",
                overflow: "hidden",
                maxHeight: 28,
              }}
            >
              {nativeTitle || subtitle}
            </div>
          ) : null}

          {description ? (
            <div
              style={{
                fontSize: 16,
                color: "#94a3b8",
                lineHeight: 1.45,
                fontWeight: 400,
                overflow: "hidden",
                maxHeight: 50,
              }}
            >
              {description}
            </div>
          ) : null}

          {genreList.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              {genreList.map((g) => (
                <div
                  key={g}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#cbd5e1",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {g}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Bottom: Score pill + Domain link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {score ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 14px",
                borderRadius: 8,
                backgroundColor: "rgba(251,191,36,0.12)",
                border: "1px solid rgba(251,191,36,0.25)",
              }}
            >
              <span style={{ color: "#fbbf24", fontSize: 16 }}>★</span>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {score}
              </span>
              <span style={{ color: "rgba(251,191,36,0.7)", fontSize: 11 }}>
                /10
              </span>
            </div>
          ) : (
            <div />
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: accent,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            yozora.moe →
          </div>
        </div>
      </div>

      {/* Right Column: Clean Poster Artwork Card */}
      {imageDataUri ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 320,
              height: 470,
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
              position: "relative",
              display: "flex",
            }}
          >
            <img
              src={imageDataUri}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Subtle bottom gradient sheen */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(180deg, transparent 72%, rgba(7,8,14,0.7) 100%)",
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CharacterCard({
  title,
  nativeTitle,
  description,
  tag,
  imageDataUri,
  accent,
}: {
  title: string
  nativeTitle: string
  description: string
  tag: string
  imageDataUri: string
  accent: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#07080e",
        color: "#ffffff",
        fontFamily: DISPLAY_FONT,
        position: "relative",
        overflow: "hidden",
        padding: "52px 64px",
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 600,
          height: 600,
          borderRadius: 999,
          backgroundImage: `radial-gradient(circle, ${accent}25 0%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: 999,
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Left Column: Character Lore & Name */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          flex: 1,
          paddingRight: 48,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={YOZORA_EYE_LOGO_BASE64}
            alt="Yozora"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            YOZORA
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 18,
              margin: "0 4px",
            }}
          >
            /
          </span>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              backgroundColor: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.3)",
              color: "#d8b4fe",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {tag || "Character Dossier"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              color: accent,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 18,
                height: 2.5,
                backgroundColor: accent,
                borderRadius: 99,
              }}
            />
            Anime Character Profile
          </div>

          <div
            style={{
              fontSize: titleFontSize(title, 56),
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              color: "#ffffff",
              overflow: "hidden",
              maxHeight: 155,
            }}
          >
            {title}
          </div>

          {nativeTitle ? (
            <div
              style={{
                fontFamily: JP_FONT,
                fontSize: 22,
                fontWeight: 700,
                color: "#94a3b8",
              }}
            >
              {nativeTitle}
            </div>
          ) : null}

          {description ? (
            <div
              style={{
                fontSize: 17,
                color: "#94a3b8",
                lineHeight: 1.45,
                fontWeight: 400,
                overflow: "hidden",
                maxHeight: 76,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Voice Actors • Roles • Lore
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: accent,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            yozora.moe →
          </div>
        </div>
      </div>

      {/* Right Column: Character Portrait */}
      {imageDataUri ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 320,
              height: 470,
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
              position: "relative",
              display: "flex",
            }}
          >
            <img
              src={imageDataUri}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(180deg, transparent 72%, rgba(7,8,14,0.7) 100%)",
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function generateSvgFallback(
  title: string,
  description: string,
  accent = "#38bdf8"
) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07080e"/>
      <stop offset="100%" stop-color="#0b0d18"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="15%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="68" y="90" font-family="sans-serif" font-weight="700" font-size="24" fill="#ffffff" letter-spacing="-0.5">YOZORA</text>
  <text x="175" y="90" font-family="sans-serif" font-weight="700" font-size="16" fill="rgba(255,255,255,0.45)">夜空</text>
  <rect x="68" y="240" width="24" height="3" fill="${accent}"/>
  <text x="68" y="320" font-family="sans-serif" font-weight="700" font-size="52" fill="#ffffff">${esc(title)}</text>
  <text x="68" y="380" font-family="sans-serif" font-size="20" fill="#94a3b8">${esc(description)}</text>
  <line x1="68" y1="540" x2="1132" y2="540" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="68" y="580" font-family="sans-serif" font-weight="600" font-size="13" fill="#64748b" letter-spacing="1">YOZORA.MOE • SEASONAL ANIME INTELLIGENCE</text>
  <text x="1040" y="580" font-family="sans-serif" font-weight="700" font-size="14" fill="${accent}">yozora.moe →</text>
</svg>`
}

/** Handles dynamic OpenGraph social card image generation. */
export async function handleOgImageRequest({ request }: { request: Request }) {
  try {
    const url = new URL(request.url)
    const { searchParams } = url

    const type = searchParams.get("type") || "generic"
    const title = textParam(searchParams, "title", "Yozora", 140)
    const subtitle = textParam(searchParams, "subtitle", "", 120)
    const native = textParam(searchParams, "native", "", 100)
    const tag = textParam(searchParams, "tag", "Anime Discovery Radar", 60)
    const description = textParam(
      searchParams,
      "description",
      "Discover anime, follow live airing schedules, explore characters, and play lossless opening and ending themes.",
      280
    )
    const rawImageUrl = searchParams.get("image")

    // Dynamic accent color by category
    const defaultAccent =
      type === "airing"
        ? "#10b981"
        : type === "seasonal"
          ? "#ec4899"
          : type === "character"
            ? "#c084fc"
            : type === "search"
              ? "#a855f7"
              : "#38bdf8"
    const accent = safeAccent(
      searchParams.get("accent") || defaultAccent,
      defaultAccent
    )

    let imageDataUri = ""
    if ((type === "anime" || type === "character") && rawImageUrl) {
      imageDataUri = await fetchSafeImageDataUri(rawImageUrl)
    }

    const fonts = await loadOgFonts()

    // Determine feature pills for editorial cards
    let pills: string[] = []
    if (type === "home") {
      pills = [
        "Real-Time Airing Grid",
        "Lossless Theme Archives",
        "AniList & MAL Sync",
        "Ad-Free & Open-Source",
      ]
    } else if (type === "seasonal") {
      pills = [
        "Television Premieres",
        "Seasonal Charts & Scores",
        "Creditless OP / ED Themes",
        "Broadcast Timetables",
      ]
    } else if (type === "airing") {
      pills = [
        "7-Day Airing Grid",
        "Live Episode Countdowns",
        "JST Network Sync",
        "Lossless Themes",
      ]
    } else if (type === "library" || type === "user") {
      pills = [
        "Watchlist Tracker",
        "Episode Progress",
        "Personal Ratings",
        "Custom Shelves",
      ]
    } else if (type === "about") {
      pills = [
        "Zero Ads & Trackers",
        "Dual-Engine Failover",
        "1080p Lossless Audio",
        "Community First",
      ]
    }

    let card: React.ReactNode
    if (type === "anime") {
      card = (
        <AnimeCard
          title={title}
          subtitle={subtitle}
          nativeTitle={native}
          description={description}
          tag={tag}
          genres={textParam(searchParams, "genres", "", 120)}
          score={textParam(searchParams, "score", "", 16)}
          imageDataUri={imageDataUri}
          year={textParam(searchParams, "year", "", 16)}
          format={textParam(searchParams, "format", "", 24)}
          episodes={textParam(searchParams, "episodes", "", 16)}
          accent={accent}
        />
      )
    } else if (type === "character") {
      card = (
        <CharacterCard
          title={title}
          nativeTitle={native}
          description={description}
          tag={tag}
          imageDataUri={imageDataUri}
          accent={accent}
        />
      )
    } else {
      card = (
        <EditorialCard
          type={type}
          title={title}
          subtitle={subtitle}
          description={description}
          tag={tag}
          accent={accent}
          pills={pills}
        />
      )
    }

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

    return new ImageResponse(card, options)
  } catch (err) {
    console.error("[OG Image Error]:", err)
    const fallbackSvg = generateSvgFallback(
      "Yozora Anime",
      "Television broadcast radar & theme archives"
    )
    return new Response(fallbackSvg, {
      headers: {
        "content-type": "image/svg+xml",
        "cache-control": "no-store",
      },
    })
  }
}
