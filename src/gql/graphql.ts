/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never
    }
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core"
/** The role the character plays in the media */
export type CharacterRole =
  /** A background character in the media */
  | "BACKGROUND"
  /** A primary character role in the media */
  | "MAIN"
  /** A supporting character role in the media */
  | "SUPPORTING"

/** The format the media was released in */
export type MediaFormat =
  /** Professionally published manga with more than one chapter */
  | "MANGA"
  /** Anime movies with a theatrical release */
  | "MOVIE"
  /** Short anime released as a music video */
  | "MUSIC"
  /** Written books released as a series of light novels */
  | "NOVEL"
  /** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
  | "ONA"
  /** Manga with just one chapter */
  | "ONE_SHOT"
  /** (Original Video Animation) Anime that have been released directly on DVD/Blu-ray without originally going through a theatrical release or television broadcast */
  | "OVA"
  /** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
  | "SPECIAL"
  /** Anime broadcast on television */
  | "TV"
  /** Anime which are under 15 minutes in length and broadcast on television */
  | "TV_SHORT"

export type MediaSeason =
  /** Predominantly started airing between October and November */
  | "FALL"
  /** Predominantly started airing between April and June */
  | "SPRING"
  /** Predominantly started airing between July and September */
  | "SUMMER"
  /** Predominantly started airing between January and March */
  | "WINTER"

/** Media sort enums */
export type MediaSort =
  | "CHAPTERS"
  | "CHAPTERS_DESC"
  | "DURATION"
  | "DURATION_DESC"
  | "END_DATE"
  | "END_DATE_DESC"
  | "EPISODES"
  | "EPISODES_DESC"
  | "FAVOURITES"
  | "FAVOURITES_DESC"
  | "FORMAT"
  | "FORMAT_DESC"
  | "ID"
  | "ID_DESC"
  | "POPULARITY"
  | "POPULARITY_DESC"
  | "SCORE"
  | "SCORE_DESC"
  | "SEARCH_MATCH"
  | "START_DATE"
  | "START_DATE_DESC"
  | "STATUS"
  | "STATUS_DESC"
  | "TITLE_ENGLISH"
  | "TITLE_ENGLISH_DESC"
  | "TITLE_NATIVE"
  | "TITLE_NATIVE_DESC"
  | "TITLE_ROMAJI"
  | "TITLE_ROMAJI_DESC"
  | "TRENDING"
  | "TRENDING_DESC"
  | "TYPE"
  | "TYPE_DESC"
  | "UPDATED_AT"
  | "UPDATED_AT_DESC"
  | "VOLUMES"
  | "VOLUMES_DESC"

/** The current releasing status of the media */
export type MediaStatus =
  /** Ended before the work could be finished */
  | "CANCELLED"
  /** Has completed and is no longer being released */
  | "FINISHED"
  /** Version 2 only. Is currently paused from releasing and will resume at a later date */
  | "HIATUS"
  /** To be released at a later date */
  | "NOT_YET_RELEASED"
  /** Currently releasing */
  | "RELEASING"

export type AnimeCatalogQueryVariables = Exact<{
  sort?: Array<MediaSort | null | undefined> | MediaSort | null | undefined
  season?: MediaSeason | null | undefined
  seasonYear?: number | null | undefined
  status?: MediaStatus | null | undefined
}>

export type AnimeCatalogQuery = {
  Page: {
    media: Array<{
      id: number
      idMal: number | null
      bannerImage: string | null
      averageScore: number | null
      seasonYear: number | null
      format: MediaFormat | null
      status: MediaStatus | null
      episodes: number | null
      duration: number | null
      popularity: number | null
      favourites: number | null
      genres: Array<string | null> | null
      description: string | null
      title: {
        romaji: string | null
        english: string | null
        native: string | null
      } | null
      coverImage: {
        medium: string | null
        large: string | null
        extraLarge: string | null
        color: string | null
      } | null
      startDate: { year: number | null } | null
      trailer: {
        id: string | null
        site: string | null
        thumbnail: string | null
      } | null
      nextAiringEpisode: {
        episode: number
        airingAt: number
        timeUntilAiring: number
      } | null
      studios: { nodes: Array<{ name: string } | null> | null } | null
    } | null> | null
  } | null
}

export type AnimeSearchQueryVariables = Exact<{
  search: string
}>

export type AnimeSearchQuery = {
  Page: {
    media: Array<{
      id: number
      idMal: number | null
      bannerImage: string | null
      averageScore: number | null
      seasonYear: number | null
      format: MediaFormat | null
      status: MediaStatus | null
      episodes: number | null
      duration: number | null
      popularity: number | null
      favourites: number | null
      genres: Array<string | null> | null
      description: string | null
      title: {
        romaji: string | null
        english: string | null
        native: string | null
      } | null
      coverImage: {
        medium: string | null
        large: string | null
        extraLarge: string | null
        color: string | null
      } | null
      startDate: { year: number | null } | null
      trailer: {
        id: string | null
        site: string | null
        thumbnail: string | null
      } | null
      nextAiringEpisode: {
        episode: number
        airingAt: number
        timeUntilAiring: number
      } | null
      studios: { nodes: Array<{ name: string } | null> | null } | null
    } | null> | null
  } | null
}

export type AiringScheduleQueryVariables = Exact<{
  now: number
}>

export type AiringScheduleQuery = {
  Page: {
    airingSchedules: Array<{
      id: number
      episode: number
      airingAt: number
      timeUntilAiring: number
      media: {
        id: number
        idMal: number | null
        bannerImage: string | null
        averageScore: number | null
        seasonYear: number | null
        format: MediaFormat | null
        status: MediaStatus | null
        episodes: number | null
        duration: number | null
        popularity: number | null
        favourites: number | null
        genres: Array<string | null> | null
        description: string | null
        title: {
          romaji: string | null
          english: string | null
          native: string | null
        } | null
        coverImage: {
          medium: string | null
          large: string | null
          extraLarge: string | null
          color: string | null
        } | null
        startDate: { year: number | null } | null
        trailer: {
          id: string | null
          site: string | null
          thumbnail: string | null
        } | null
        nextAiringEpisode: {
          episode: number
          airingAt: number
          timeUntilAiring: number
        } | null
        studios: { nodes: Array<{ name: string } | null> | null } | null
      } | null
    } | null> | null
  } | null
}

export type AnimeDetailQueryVariables = Exact<{
  id: number
}>

export type AnimeDetailQuery = {
  Media: {
    id: number
    idMal: number | null
    bannerImage: string | null
    averageScore: number | null
    seasonYear: number | null
    format: MediaFormat | null
    status: MediaStatus | null
    episodes: number | null
    duration: number | null
    popularity: number | null
    favourites: number | null
    genres: Array<string | null> | null
    description: string | null
    title: {
      romaji: string | null
      english: string | null
      native: string | null
    } | null
    coverImage: {
      medium: string | null
      large: string | null
      extraLarge: string | null
      color: string | null
    } | null
    startDate: { year: number | null } | null
    trailer: {
      id: string | null
      site: string | null
      thumbnail: string | null
    } | null
    nextAiringEpisode: {
      episode: number
      airingAt: number
      timeUntilAiring: number
    } | null
    studios: { nodes: Array<{ name: string } | null> | null } | null
    relations: {
      edges: Array<{
        node: {
          id: number
          idMal: number | null
          bannerImage: string | null
          averageScore: number | null
          seasonYear: number | null
          format: MediaFormat | null
          status: MediaStatus | null
          episodes: number | null
          duration: number | null
          popularity: number | null
          favourites: number | null
          genres: Array<string | null> | null
          description: string | null
          title: {
            romaji: string | null
            english: string | null
            native: string | null
          } | null
          coverImage: {
            medium: string | null
            large: string | null
            extraLarge: string | null
            color: string | null
          } | null
          startDate: { year: number | null } | null
          trailer: {
            id: string | null
            site: string | null
            thumbnail: string | null
          } | null
          nextAiringEpisode: {
            episode: number
            airingAt: number
            timeUntilAiring: number
          } | null
          studios: { nodes: Array<{ name: string } | null> | null } | null
        } | null
      } | null> | null
    } | null
    recommendations: {
      nodes: Array<{
        mediaRecommendation: {
          id: number
          idMal: number | null
          bannerImage: string | null
          averageScore: number | null
          seasonYear: number | null
          format: MediaFormat | null
          status: MediaStatus | null
          episodes: number | null
          duration: number | null
          popularity: number | null
          favourites: number | null
          genres: Array<string | null> | null
          description: string | null
          title: {
            romaji: string | null
            english: string | null
            native: string | null
          } | null
          coverImage: {
            medium: string | null
            large: string | null
            extraLarge: string | null
            color: string | null
          } | null
          startDate: { year: number | null } | null
          trailer: {
            id: string | null
            site: string | null
            thumbnail: string | null
          } | null
          nextAiringEpisode: {
            episode: number
            airingAt: number
            timeUntilAiring: number
          } | null
          studios: { nodes: Array<{ name: string } | null> | null } | null
        } | null
      } | null> | null
    } | null
    characters: {
      edges: Array<{
        role: CharacterRole | null
        node: {
          id: number
          name: { full: string | null } | null
          image: { large: string | null; medium: string | null } | null
        } | null
        voiceActors: Array<{
          id: number
          languageV2: string | null
          name: { full: string | null; native: string | null } | null
          image: { large: string | null; medium: string | null } | null
        } | null> | null
      } | null> | null
    } | null
    externalLinks: Array<{
      id: number
      site: string
      url: string | null
      icon: string | null
      color: string | null
    } | null> | null
  } | null
}

export type CharacterDetailQueryVariables = Exact<{
  id: number
}>

export type CharacterDetailQuery = {
  Character: {
    id: number
    description: string | null
    gender: string | null
    age: string | null
    favourites: number | null
    name: {
      full: string | null
      native: string | null
      alternative: Array<string | null> | null
    } | null
    image: { large: string | null; medium: string | null } | null
    dateOfBirth: {
      year: number | null
      month: number | null
      day: number | null
    } | null
    media: {
      nodes: Array<{
        id: number
        idMal: number | null
        bannerImage: string | null
        averageScore: number | null
        seasonYear: number | null
        format: MediaFormat | null
        status: MediaStatus | null
        episodes: number | null
        duration: number | null
        popularity: number | null
        favourites: number | null
        genres: Array<string | null> | null
        description: string | null
        title: {
          romaji: string | null
          english: string | null
          native: string | null
        } | null
        coverImage: {
          medium: string | null
          large: string | null
          extraLarge: string | null
          color: string | null
        } | null
        startDate: { year: number | null } | null
        trailer: {
          id: string | null
          site: string | null
          thumbnail: string | null
        } | null
        nextAiringEpisode: {
          episode: number
          airingAt: number
          timeUntilAiring: number
        } | null
        studios: { nodes: Array<{ name: string } | null> | null } | null
      } | null> | null
    } | null
  } | null
}

export type BatchAnimeQueryVariables = Exact<{
  ids?: Array<number | null | undefined> | number | null | undefined
}>

export type BatchAnimeQuery = {
  Page: {
    media: Array<{
      id: number
      idMal: number | null
      bannerImage: string | null
      averageScore: number | null
      seasonYear: number | null
      format: MediaFormat | null
      status: MediaStatus | null
      episodes: number | null
      duration: number | null
      popularity: number | null
      favourites: number | null
      genres: Array<string | null> | null
      description: string | null
      title: {
        romaji: string | null
        english: string | null
        native: string | null
      } | null
      coverImage: {
        medium: string | null
        large: string | null
        extraLarge: string | null
        color: string | null
      } | null
      startDate: { year: number | null } | null
      trailer: {
        id: string | null
        site: string | null
        thumbnail: string | null
      } | null
      nextAiringEpisode: {
        episode: number
        airingAt: number
        timeUntilAiring: number
      } | null
      studios: { nodes: Array<{ name: string } | null> | null } | null
    } | null> | null
  } | null
}

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>["__apiType"]
  >
  private value: string
  public __meta__?: Record<string, any> | undefined

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value)
    this.value = value
    this.__meta__ = __meta__
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value
  }
}

export const AnimeCatalogDocument = new TypedDocumentString(`
    query AnimeCatalog($sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $status: MediaStatus) {
  Page(page: 1, perPage: 18) {
    media(
      type: ANIME
      isAdult: false
      sort: $sort
      season: $season
      seasonYear: $seasonYear
      status: $status
    ) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
        large
        extraLarge
        color
      }
      bannerImage
      averageScore
      seasonYear
      startDate {
        year
      }
      format
      status
      episodes
      duration
      popularity
      favourites
      genres
      description(asHtml: false)
      trailer {
        id
        site
        thumbnail
      }
      nextAiringEpisode {
        episode
        airingAt
        timeUntilAiring
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  AnimeCatalogQuery,
  AnimeCatalogQueryVariables
>
export const AnimeSearchDocument = new TypedDocumentString(`
    query AnimeSearch($search: String!) {
  Page(page: 1, perPage: 16) {
    media(
      type: ANIME
      isAdult: false
      search: $search
      sort: [SEARCH_MATCH, POPULARITY_DESC]
    ) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
        large
        extraLarge
        color
      }
      bannerImage
      averageScore
      seasonYear
      startDate {
        year
      }
      format
      status
      episodes
      duration
      popularity
      favourites
      genres
      description(asHtml: false)
      trailer {
        id
        site
        thumbnail
      }
      nextAiringEpisode {
        episode
        airingAt
        timeUntilAiring
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  AnimeSearchQuery,
  AnimeSearchQueryVariables
>
export const AiringScheduleDocument = new TypedDocumentString(`
    query AiringSchedule($now: Int!) {
  Page(page: 1, perPage: 12) {
    airingSchedules(airingAt_greater: $now, sort: TIME) {
      id
      episode
      airingAt
      timeUntilAiring
      media {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
          large
          extraLarge
          color
        }
        bannerImage
        averageScore
        seasonYear
        startDate {
          year
        }
        format
        status
        episodes
        duration
        popularity
        favourites
        genres
        description(asHtml: false)
        trailer {
          id
          site
          thumbnail
        }
        nextAiringEpisode {
          episode
          airingAt
          timeUntilAiring
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  AiringScheduleQuery,
  AiringScheduleQueryVariables
>
export const AnimeDetailDocument = new TypedDocumentString(`
    query AnimeDetail($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
    }
    coverImage {
      medium
      large
      extraLarge
      color
    }
    bannerImage
    averageScore
    seasonYear
    startDate {
      year
    }
    format
    status
    episodes
    duration
    popularity
    favourites
    genres
    description(asHtml: false)
    trailer {
      id
      site
      thumbnail
    }
    nextAiringEpisode {
      episode
      airingAt
      timeUntilAiring
    }
    studios(isMain: true) {
      nodes {
        name
      }
    }
    relations {
      edges {
        node {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
            extraLarge
            color
          }
          bannerImage
          averageScore
          seasonYear
          startDate {
            year
          }
          format
          status
          episodes
          duration
          popularity
          favourites
          genres
          description(asHtml: false)
          trailer {
            id
            site
            thumbnail
          }
          nextAiringEpisode {
            episode
            airingAt
            timeUntilAiring
          }
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
    recommendations(page: 1, perPage: 8, sort: RATING_DESC) {
      nodes {
        mediaRecommendation {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            medium
            large
            extraLarge
            color
          }
          bannerImage
          averageScore
          seasonYear
          startDate {
            year
          }
          format
          status
          episodes
          duration
          popularity
          favourites
          genres
          description(asHtml: false)
          trailer {
            id
            site
            thumbnail
          }
          nextAiringEpisode {
            episode
            airingAt
            timeUntilAiring
          }
          studios(isMain: true) {
            nodes {
              name
            }
          }
        }
      }
    }
    characters(page: 1, perPage: 8, sort: [ROLE, RELEVANCE]) {
      edges {
        role
        node {
          id
          name {
            full
          }
          image {
            large
            medium
          }
        }
        voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
          id
          name {
            full
            native
          }
          image {
            large
            medium
          }
          languageV2
        }
      }
    }
    externalLinks {
      id
      site
      url
      icon
      color
    }
  }
}
    `) as unknown as TypedDocumentString<
  AnimeDetailQuery,
  AnimeDetailQueryVariables
>
export const CharacterDetailDocument = new TypedDocumentString(`
    query CharacterDetail($id: Int!) {
  Character(id: $id) {
    id
    name {
      full
      native
      alternative
    }
    image {
      large
      medium
    }
    description(asHtml: false)
    gender
    age
    dateOfBirth {
      year
      month
      day
    }
    favourites
    media(page: 1, perPage: 12, sort: POPULARITY_DESC, type: ANIME) {
      nodes {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
          large
          extraLarge
          color
        }
        bannerImage
        averageScore
        seasonYear
        startDate {
          year
        }
        format
        status
        episodes
        duration
        popularity
        favourites
        genres
        description(asHtml: false)
        trailer {
          id
          site
          thumbnail
        }
        nextAiringEpisode {
          episode
          airingAt
          timeUntilAiring
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  CharacterDetailQuery,
  CharacterDetailQueryVariables
>
export const BatchAnimeDocument = new TypedDocumentString(`
    query BatchAnime($ids: [Int]) {
  Page(page: 1, perPage: 50) {
    media(id_in: $ids, type: ANIME, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
        large
        extraLarge
        color
      }
      bannerImage
      averageScore
      seasonYear
      startDate {
        year
      }
      format
      status
      episodes
      duration
      popularity
      favourites
      genres
      description(asHtml: false)
      trailer {
        id
        site
        thumbnail
      }
      nextAiringEpisode {
        episode
        airingAt
        timeUntilAiring
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  BatchAnimeQuery,
  BatchAnimeQueryVariables
>
