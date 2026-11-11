import { graphql } from "@/gql/themes"

/**
 * Fetches every theme (OP/ED/IN) for an anime matched through its AniList ID.
 *
 * Uses the AnimeThemes GraphQL API (`filterAnimeByExternalSite`) so the lookup
 * is a single round-trip: anime + themes + entries + videos + audio + song
 * credits, fully typed against the upstream schema.
 */
export const AnimeThemesDocument = graphql(`
  query AnimeThemes($anilistId: Int!) {
    filterAnimeByExternalSite(site: ANILIST, id: [$anilistId]) {
      id
      slug
      title {
        romaji
        english
        native
      }
      themes {
        id
        sequence
        slug
        type
        song {
          title {
            romaji
            native
          }
          staff {
            role
            as
            artist {
              id
              slug
              name {
                main
              }
            }
          }
        }
        entries {
          id
          version
          episodes
          notes
          nsfw
          spoiler
          videos {
            nodes {
              id
              link
              resolution
              size
              tags
              nc
              subbed
              lyrics
              overlap
              source
              mimetype
              audio {
                link
                mimetype
                size
              }
            }
          }
        }
      }
    }
  }
`)
