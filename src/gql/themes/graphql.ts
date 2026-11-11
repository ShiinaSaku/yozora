/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ThemeType =
  /** Ending */
  | 'ED'
  /** Insert Song */
  | 'IN'
  /** Opening */
  | 'OP';

export type VideoOverlap =
  | 'NONE'
  | 'OVER'
  | 'TRANS';

export type VideoSource =
  | 'BD'
  | 'DVD'
  | 'LD'
  | 'RAW'
  | 'VHS'
  | 'WEB';

export type AnimeThemesQueryVariables = Exact<{
  anilistId: number;
}>;


export type AnimeThemesQuery = { filterAnimeByExternalSite: Array<{ id: number, slug: string, title: { romaji: string, english: string | null, native: string | null }, themes: Array<{ id: number, sequence: number | null, slug: string, type: ThemeType, song: { title: { romaji: string | null, native: string | null }, staff: Array<{ role: string, as: string | null, artist: { id: number, slug: string, name: { main: string } } }> } | null, entries: Array<{ id: number, version: number, episodes: string | null, notes: string | null, nsfw: boolean, spoiler: boolean, videos: { nodes: Array<{ id: number, link: string, resolution: number | null, size: number | null, tags: string, nc: boolean, subbed: boolean, lyrics: boolean, overlap: VideoOverlap, source: VideoSource | null, mimetype: string, audio: { link: string, mimetype: string, size: number } | null }> } }> }> }> };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AnimeThemesDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<AnimeThemesQuery, AnimeThemesQueryVariables>;