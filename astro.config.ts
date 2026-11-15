import { defineConfig, fontProviders } from "astro/config"
import { cacheCloudflare } from "@astrojs/cloudflare/cache"
import cloudflare from "@astrojs/cloudflare"
import { shadcn } from "@clerk/ui/themes"
import clerk from "@clerk/astro"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

// Static-first: every page prerenders at build time and is served from
// Cloudflare's asset store without invoking the Worker. Pages that need
// request-time data opt out with `export const prerender = false`, and get
// their responses cached at the edge through the route rules below.
export default defineConfig({
  site: "https://yozora.moe",
  // Flat prerendered files (about.html) so Cloudflare's drop-trailing-slash
  // asset handling serves /about directly with canonical URLs kept slash-free.
  build: {
    format: "file",
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Capriola",
      cssVariable: "--font-capriola",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Space Mono",
      cssVariable: "--font-space-mono",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Zen Maru Gothic",
      cssVariable: "--font-zen-maru",
      weights: [400],
      styles: ["normal"],
      subsets: ["japanese"],
      fallbacks: ["sans-serif"],
    },
  ],
  image: {
    // Remote AniList/MAL art is authorised for astro:assets. The adapter uses
    // passthrough (no paid image transforms), so these render as plain <img>
    // with intrinsic size, lazy loading and async decoding.
    domains: ["s4.anilist.co", "cdn.myanimelist.net", "img.youtube.com"],
  },
  adapter: cloudflare({
    // No astro:assets image transforms anywhere in the UI (plain <img>
    // components) — passthrough avoids the IMAGES binding requirement.
    imageService: "passthrough",
  }),
  integrations: [
    clerk({
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
      appearance: { theme: shadcn },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
  },
  cache: {
    provider: cacheCloudflare(),
  },
  routeRules: {
    "/": { maxAge: 300, swr: 60 },
    "/seasonal": { maxAge: 1800, swr: 300 },
    // Public, on-demand pages with reusable responses.
    "/character/[id]": { maxAge: 604800, swr: 86400 },
    "/anime/[id]": { maxAge: 604800, swr: 86400 },
    "/u/[handle]": { maxAge: 3600, swr: 300 },
    "/airing": { maxAge: 120 },
    "/search": { maxAge: 60 },
  },
})
