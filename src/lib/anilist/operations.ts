import { graphql } from "@/gql"

export const AnimeCatalogDocument = graphql(/* GraphQL */ `
  query AnimeCatalog(
    $sort: [MediaSort]
    $season: MediaSeason
    $seasonYear: Int
    $status: MediaStatus
  ) {
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
`)

export const AnimeSearchDocument = graphql(/* GraphQL */ `
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
`)

export const AiringScheduleDocument = graphql(/* GraphQL */ `
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
`)

export const AnimeDetailDocument = graphql(/* GraphQL */ `
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
`)

export const CharacterDetailDocument = graphql(/* GraphQL */ `
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
`)

export const BatchAnimeDocument = graphql(/* GraphQL */ `
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
`)
