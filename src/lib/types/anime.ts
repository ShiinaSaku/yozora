export interface AnimeTitles {
  romaji?: string
  english?: string
  native?: string
}

export interface AnimeTrailer {
  id: string
  site: string
  thumbnail?: string
}

export interface AnimeAiring {
  episode: number
  airingAt: number
  timeUntilAiring: number
}

export interface Anime {
  id: number
  idMal?: number
  title: string
  subtitle?: string
  cover: string
  coverMedium?: string
  coverLarge?: string
  coverExtraLarge?: string
  banner?: string
  accent: string
  score: number
  year: number
  format: string
  status?: string
  episodes?: number
  duration?: number
  popularity?: number
  favourites?: number
  tags: string[]
  description?: string
  titles?: AnimeTitles
  trailer?: AnimeTrailer
  studios?: string[]
  nextAiring?: AnimeAiring
}

export interface WatchProgress {
  current: number
  total: number
  nextEpisode: string
}

export interface AnimeCharacter {
  id: number
  name: string
  image?: string
  role: string
  voiceActor?: {
    name: string
    image?: string
    language: string
  }
}

export interface CharacterDetail {
  id: number
  name: {
    full: string
    native?: string
    alternative?: string[]
  }
  image?: string
  description?: string
  gender?: string
  age?: string
  bloodType?: string
  dateOfBirth?: {
    year?: number
    month?: number
    day?: number
  }
  favourites?: number
  media: Anime[]
}

export interface AnimeExternalLink {
  id: number
  url: string
  site: string
  icon?: string
  color?: string
  type?: string
  language?: string
}

export interface AnimeDetailResponse {
  anime: Anime
  relations: Anime[]
  recommendations: Anime[]
  characters: AnimeCharacter[]
  externalLinks?: AnimeExternalLink[]
}

export interface AiringScheduleItem {
  id: number
  episode: number
  airingAt: number
  timeUntilAiring: number
  media: Anime
}

export interface AnimeThemeVideo {
  id: number
  link: string
  resolution: number | null
  size: number | null
  tags: string | null
  nc: boolean
  subbed: boolean
  lyrics: boolean
  source: string | null
  audio?: {
    link: string
    mimetype: string | null
    size: number | null
  }
}

export interface AnimeThemeEntry {
  version: number
  episodes?: string
  notes?: string
  nsfw: boolean
  spoiler: boolean
  video?: AnimeThemeVideo
  videos?: AnimeThemeVideo[]
}

export interface AnimeTheme {
  id: number
  type: "OP" | "ED"
  sequence: number | null
  slug: string
  title: string
  artists: string[]
  entries: AnimeThemeEntry[]
}

export interface AnimeThemesResponse {
  animeId: number
  slug?: string
  themes: AnimeTheme[]
}
