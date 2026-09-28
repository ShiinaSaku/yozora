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
const MONO_FONT = "monospace"

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

function titleFontSize(title: string, base = 56): number {
  const len = title.length
  if (len > 80) return Math.round(base * 0.65)
  if (len > 50) return Math.round(base * 0.78)
  if (len > 32) return Math.round(base * 0.88)
  return base
}

/**
 * Clean Vercel / shadcn neutral brand header with breadcrumb and status pill.
 */
function VercelBrandHeader({
  section = "RADAR",
  badgeText,
  live = false,
}: {
  section?: string
  badgeText?: string
  live?: boolean
}) {
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
      {/* Brand logo + wordmark + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#000000",
            border: "1px solid rgba(255, 255, 255, 0.16)",
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 20,
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
              fontSize: 14,
              fontWeight: 700,
              color: "#71717a",
            }}
          >
            夜空
          </span>
          <span
            style={{
              fontSize: 16,
              color: "#3f3f46",
              margin: "0 2px",
            }}
          >
            /
          </span>
          <span
            style={{
              fontFamily: MONO_FONT,
              fontSize: 11,
              fontWeight: 600,
              color: "#a1a1aa",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {section}
          </span>
        </div>
      </div>

      {/* Right status badge */}
      {badgeText ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#e4e4e7",
            fontFamily: MONO_FONT,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {live ? (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 9999,
                backgroundColor: "#22c55e",
              }}
            />
          ) : null}
          {badgeText}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Standard Vercel footer with domain, tag and minimalist arrow button.
 */
function VercelFooter() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        paddingTop: 18,
        width: "100%",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#71717a",
          fontFamily: MONO_FONT,
          fontSize: 12,
          letterSpacing: "0.06em",
        }}
      >
        <span style={{ color: "#a1a1aa", fontWeight: 600 }}>yozora.moe</span>
        <span style={{ color: "#3f3f46" }}>•</span>
        <span>Open Anime Intelligence & 1080p Themes</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 14px",
          borderRadius: 8,
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          color: "#ffffff",
          fontFamily: MONO_FONT,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <span>yozora.moe</span>
        <span style={{ color: "#a1a1aa" }}>↗</span>
      </div>
    </div>
  )
}

/**
 * Shared Vercel shell container with precision hairline grid and inset framed workspace.
 */
function VercelCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: DISPLAY_FONT,
        position: "relative",
        padding: 28,
        overflow: "hidden",
      }}
    >
      {/* Precision hairline architectural grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top ambient spotlight flare */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: 200,
          width: 800,
          height: 360,
          borderRadius: 9999,
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 75%)",
        }}
      />

      {/* Inset framed container */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(9, 9, 11, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 20,
          padding: "36px 44px",
          overflow: "hidden",
        }}
      >
        {/* Corner registration crosshairs */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 14,
            color: "#52525b",
            fontFamily: MONO_FONT,
            fontSize: 13,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          +
        </span>
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            color: "#52525b",
            fontFamily: MONO_FONT,
            fontSize: 13,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          +
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 10,
            left: 14,
            color: "#52525b",
            fontFamily: MONO_FONT,
            fontSize: 13,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          +
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 10,
            right: 14,
            color: "#52525b",
            fontFamily: MONO_FONT,
            fontSize: 13,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          +
        </span>

        {children}
      </div>
    </div>
  )
}

function EditorialCard({
  type,
  title,
  subtitle,
  description,
  tag,
  pills = [],
}: {
  type: string
  title: string
  subtitle?: string
  description: string
  tag: string
  pills?: string[]
}) {
  const isAiring = type === "airing"
  const isHome = type === "home"

  return (
    <VercelCardShell>
      {/* Top Header */}
      <VercelBrandHeader
        section={type.toUpperCase()}
        badgeText={tag || (isAiring ? "LIVE BROADCASTS" : "OPEN PLATFORM")}
        live={isAiring || isHome}
      />

      {/* Main Hero Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 920,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#a1a1aa",
            fontFamily: MONO_FONT,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span>//</span>
          <span>{subtitle || "THE MODERN ANIME DISCOVERY PLATFORM"}</span>
        </div>

        <div
          style={{
            fontSize: titleFontSize(title, 56),
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.06,
            color: "#ffffff",
            overflow: "hidden",
            maxHeight: 140,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 18,
            color: "#a1a1aa",
            lineHeight: 1.5,
            fontWeight: 400,
            overflow: "hidden",
            maxHeight: 56,
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
            {pills.map((pill, idx) => (
              <div
                key={pill}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#71717a",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#e4e4e7",
                  }}
                >
                  {pill}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <VercelFooter />
    </VercelCardShell>
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
}) {
  const genreList = genres
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
    .slice(0, 3)

  const size = titleFontSize(title, 48)

  return (
    <VercelCardShell>
      {/* Background Poster Ambience (subtle & monochrome) */}
      {imageDataUri ? (
        <img
          src={imageDataUri}
          alt=""
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 600,
            height: 600,
            objectFit: "cover",
            opacity: 0.08,
            zIndex: 0,
          }}
        />
      ) : null}

      {/* Main Two-Column Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          zIndex: 10,
        }}
      >
        {/* Left Column: Metadata & Typography */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            flex: 1,
            paddingRight: 40,
          }}
        >
          {/* Top: Brand mark + chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#000000",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                overflow: "hidden",
              }}
            >
              <img
                src={YOZORA_EYE_LOGO_BASE64}
                alt="Yozora"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              YOZORA
            </span>
            <span style={{ color: "#3f3f46", fontSize: 16 }}>/</span>

            {format ? (
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: "#ffffff",
                  color: "#09090b",
                  fontFamily: MONO_FONT,
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
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#e4e4e7",
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {year}
              </div>
            ) : null}
            {episodes ? (
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#e4e4e7",
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {episodes} EP
              </div>
            ) : null}
          </div>

          {/* Center Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                color: "#a1a1aa",
                fontFamily: MONO_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {`// ${tag || "ANIME SHOWCASE & OST"}`}
            </div>

            <div
              style={{
                fontSize: size,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: "#ffffff",
                overflow: "hidden",
                maxHeight: 110,
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
                  color: "#71717a",
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
                  fontSize: 15,
                  color: "#a1a1aa",
                  lineHeight: 1.45,
                  fontWeight: 400,
                  overflow: "hidden",
                  maxHeight: 46,
                }}
              >
                {description}
              </div>
            ) : null}

            {/* Score & Genres */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              {score ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 6,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <span style={{ color: "#ffffff", fontSize: 13 }}>★</span>
                  <span
                    style={{
                      color: "#ffffff",
                      fontFamily: MONO_FONT,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {score}
                  </span>
                  <span
                    style={{
                      color: "#71717a",
                      fontFamily: MONO_FONT,
                      fontSize: 11,
                    }}
                  >
                    /10
                  </span>
                </div>
              ) : null}

              {genreList.map((g) => (
                <div
                  key={g}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#d4d4d8",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {g}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer Inside Left Column */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#71717a",
                fontFamily: MONO_FONT,
                fontSize: 11,
              }}
            >
              <span>yozora.moe</span>
              <span style={{ color: "#3f3f46" }}>•</span>
              <span>1080p Lossless Themes</span>
            </div>

            <div
              style={{
                fontFamily: MONO_FONT,
                fontSize: 11,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              yozora.moe ↗
            </div>
          </div>
        </div>

        {/* Right Column: Framed Poster Artwork */}
        {imageDataUri ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 280,
                height: 410,
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.95)",
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
                    "linear-gradient(180deg, transparent 75%, rgba(0, 0, 0, 0.8) 100%)",
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </VercelCardShell>
  )
}

function CharacterCard({
  title,
  nativeTitle,
  description,
  tag,
  imageDataUri,
}: {
  title: string
  nativeTitle: string
  description: string
  tag: string
  imageDataUri: string
}) {
  return (
    <VercelCardShell>
      {/* Background Ambience */}
      {imageDataUri ? (
        <img
          src={imageDataUri}
          alt=""
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 600,
            height: 600,
            objectFit: "cover",
            opacity: 0.08,
            zIndex: 0,
          }}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            flex: 1,
            paddingRight: 40,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#000000",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                overflow: "hidden",
              }}
            >
              <img
                src={YOZORA_EYE_LOGO_BASE64}
                alt="Yozora"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              YOZORA
            </span>
            <span style={{ color: "#3f3f46", fontSize: 16 }}>/</span>
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                backgroundColor: "#ffffff",
                color: "#09090b",
                fontFamily: MONO_FONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {tag || "CHARACTER DOSSIER"}
            </div>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                color: "#a1a1aa",
                fontFamily: MONO_FONT,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              // ANIME CHARACTER PROFILE
            </div>

            <div
              style={{
                fontSize: titleFontSize(title, 52),
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: "#ffffff",
                overflow: "hidden",
                maxHeight: 110,
              }}
            >
              {title}
            </div>

            {nativeTitle ? (
              <div
                style={{
                  fontFamily: JP_FONT,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#71717a",
                }}
              >
                {nativeTitle}
              </div>
            ) : null}

            {description ? (
              <div
                style={{
                  fontSize: 16,
                  color: "#a1a1aa",
                  lineHeight: 1.45,
                  fontWeight: 400,
                  overflow: "hidden",
                  maxHeight: 64,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: 14,
            }}
          >
            <div
              style={{
                color: "#71717a",
                fontFamily: MONO_FONT,
                fontSize: 11,
              }}
            >
              Voice Actors • Roles • Lore
            </div>
            <div
              style={{
                fontFamily: MONO_FONT,
                fontSize: 11,
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              yozora.moe ↗
            </div>
          </div>
        </div>

        {/* Right Portrait */}
        {imageDataUri ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 280,
                height: 410,
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.95)",
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
                    "linear-gradient(180deg, transparent 75%, rgba(0, 0, 0, 0.8) 100%)",
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </VercelCardShell>
  )
}

function generateSvgFallback(title: string, description: string) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
    <radialGradient id="spotlight" cx="50%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#000000"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#spotlight)"/>
  <rect x="28" y="28" width="1144" height="574" rx="20" fill="#09090b" fill-opacity="0.85" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="44" y="48" font-family="monospace" font-size="13" fill="#52525b">+</text>
  <text x="1156" y="48" font-family="monospace" font-size="13" fill="#52525b">+</text>
  <text x="44" y="586" font-family="monospace" font-size="13" fill="#52525b">+</text>
  <text x="1156" y="586" font-family="monospace" font-size="13" fill="#52525b">+</text>
  <text x="74" y="86" font-family="sans-serif" font-weight="700" font-size="20" fill="#ffffff" letter-spacing="-0.5">YOZORA</text>
  <text x="168" y="86" font-family="sans-serif" font-weight="700" font-size="14" fill="#71717a">夜空</text>
  <text x="74" y="220" font-family="monospace" font-size="12" font-weight="600" fill="#a1a1aa" letter-spacing="1.5">// OPEN ANIME INTELLIGENCE</text>
  <text x="74" y="295" font-family="sans-serif" font-weight="800" font-size="52" fill="#ffffff" letter-spacing="-1">${esc(title)}</text>
  <text x="74" y="360" font-family="sans-serif" font-size="18" fill="#a1a1aa">${esc(description)}</text>
  <line x1="74" y1="520" x2="1126" y2="520" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="74" y="555" font-family="monospace" font-size="12" fill="#71717a" letter-spacing="0.5">yozora.moe • Open Anime Intelligence &amp; 1080p Themes</text>
  <text x="1050" y="555" font-family="monospace" font-weight="600" font-size="12" fill="#ffffff">yozora.moe ↗</text>
</svg>`
}

/** Handles dynamic OpenGraph social card image generation in Vercel / shadcn neutral design. */
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

    let imageDataUri = ""
    if ((type === "anime" || type === "character") && rawImageUrl) {
      imageDataUri = await fetchSafeImageDataUri(rawImageUrl)
    }

    const fonts = await loadOgFonts()

    // Determine Vercel-style feature pills for editorial cards
    let pills: string[] = []
    if (type === "home") {
      pills = [
        "Real-Time Airing Grid",
        "Lossless Theme Archives",
        "AniList & MAL Sync",
        "Zero Ads & Open Source",
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
        "Lossless Audio",
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
