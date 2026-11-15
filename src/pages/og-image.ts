import type { APIRoute } from "astro"
import { handleOgImageRequest } from "@/lib/og/image"

export const prerender = false

export const GET: APIRoute = ({ request }) => handleOgImageRequest({ request })
