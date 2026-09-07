import * as React from "react"

export interface YozoraMarkProps extends React.SVGProps<SVGSVGElement> {
  title?: string
  withBackground?: boolean
}

export type HikariMarkProps = YozoraMarkProps

const PATH_1 =
  "M1565 4029 c-87 -18 -190 -75 -260 -143 -162 -159 -201 -407 -95 -605 17 -31 70 -110 118 -176 49 -66 189 -258 312 -427 122 -169 227 -305 231 -302 5 3 9 17 9 32 0 15 12 75 26 133 l26 107 -172 238 c-96 132 -212 291 -258 354 -47 63 -93 134 -103 157 -74 172 14 355 196 408 104 31 230 -2 301 -77 18 -18 162 -204 321 -413 506 -665 495 -648 546 -812 38 -120 47 -244 47 -662 0 -304 -3 -388 -15 -435 -38 -146 -162 -235 -314 -224 -120 9 -208 69 -260 178 l-26 55 -3 385 c-2 226 1 430 7 495 19 191 66 319 177 477 32 46 52 84 48 91 -11 19 -126 167 -130 167 -8 0 -155 -213 -187 -270 -45 -83 -91 -215 -114 -327 -16 -77 -18 -148 -18 -558 0 -428 2 -475 18 -530 47 -151 141 -266 268 -329 315 -154 683 21 754 359 18 86 21 829 4 982 -25 224 -102 397 -284 638 -129 170 -259 342 -493 650 -207 272 -258 320 -388 366 -69 24 -214 33 -289 18z"
const PATH_2 =
  "M3203 4025 c-76 -16 -168 -64 -229 -118 -36 -32 -187 -223 -381 -483 l-23 -31 66 -87 c36 -48 69 -86 74 -84 4 2 88 109 185 238 209 277 220 289 293 326 47 24 69 29 132 29 91 0 135 -15 199 -65 90 -72 130 -199 97 -312 -16 -57 -32 -79 -410 -603 -102 -142 -136 -195 -131 -210 3 -11 15 -60 26 -110 11 -49 23 -103 27 -120 7 -27 25 -4 324 407 175 239 329 458 343 487 99 196 58 437 -100 597 -127 129 -307 179 -492 139z"

/**
 * Official Yozora Monoline Emblem (Nuxt-inspired continuous geometric loop).
 * Represents the letter 'Y', celestial horizons, and the guiding night sky (夜空).
 */
export function YozoraMark({
  title = "Yozora",
  withBackground = true,
  className,
  ...props
}: YozoraMarkProps) {
  const instanceId = React.useId().replaceAll(":", "")
  const backgroundId = `yozora-bg-${instanceId}`
  const auroraId = `yozora-aurora-${instanceId}`
  const strokeGradId = `yozora-stroke-${instanceId}`

  if (!withBackground) {
    return (
      <svg
        viewBox="0 0 500 500"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        className={className}
        {...props}
      >
        <g transform="translate(0, 500) scale(0.1, -0.1)">
          <path d={PATH_1} />
          <path d={PATH_2} />
        </g>
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      {...props}
    >
      <defs>
        <linearGradient
          id={backgroundId}
          x1="0"
          y1="0"
          x2="512"
          y2="512"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#07080e" />
          <stop offset="0.6" stopColor="#0b0d18" />
          <stop offset="1" stopColor="#14172a" />
        </linearGradient>
        <radialGradient id={auroraId} cx="50%" cy="30%" r="60%">
          <stop stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={strokeGradId}
          x1="1600"
          y1="4200"
          x2="3500"
          y2="1000"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" />
          <stop offset="0.75" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#e0e7ff" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="116" fill={`url(#${backgroundId})`} />
      <rect width="512" height="512" rx="116" fill={`url(#${auroraId})`} />
      <rect
        width="510"
        height="510"
        x="1"
        y="1"
        rx="115"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.08"
        strokeWidth="2"
      />

      <g
        transform="translate(6, 506) scale(0.1, -0.1)"
        fill={`url(#${strokeGradId})`}
      >
        <path d={PATH_1} />
        <path d={PATH_2} />
      </g>
    </svg>
  )
}

/** Backwards-compatible alias for existing imports */
export const HikariMark = YozoraMark
