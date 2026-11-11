/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query AnimeThemes($anilistId: Int!) {\n    filterAnimeByExternalSite(site: ANILIST, id: [$anilistId]) {\n      id\n      slug\n      title {\n        romaji\n        english\n        native\n      }\n      themes {\n        id\n        sequence\n        slug\n        type\n        song {\n          title {\n            romaji\n            native\n          }\n          staff {\n            role\n            as\n            artist {\n              id\n              slug\n              name {\n                main\n              }\n            }\n          }\n        }\n        entries {\n          id\n          version\n          episodes\n          notes\n          nsfw\n          spoiler\n          videos {\n            nodes {\n              id\n              link\n              resolution\n              size\n              tags\n              nc\n              subbed\n              lyrics\n              overlap\n              source\n              mimetype\n              audio {\n                link\n                mimetype\n                size\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.AnimeThemesDocument,
};
const documents: Documents = {
    "\n  query AnimeThemes($anilistId: Int!) {\n    filterAnimeByExternalSite(site: ANILIST, id: [$anilistId]) {\n      id\n      slug\n      title {\n        romaji\n        english\n        native\n      }\n      themes {\n        id\n        sequence\n        slug\n        type\n        song {\n          title {\n            romaji\n            native\n          }\n          staff {\n            role\n            as\n            artist {\n              id\n              slug\n              name {\n                main\n              }\n            }\n          }\n        }\n        entries {\n          id\n          version\n          episodes\n          notes\n          nsfw\n          spoiler\n          videos {\n            nodes {\n              id\n              link\n              resolution\n              size\n              tags\n              nc\n              subbed\n              lyrics\n              overlap\n              source\n              mimetype\n              audio {\n                link\n                mimetype\n                size\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.AnimeThemesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AnimeThemes($anilistId: Int!) {\n    filterAnimeByExternalSite(site: ANILIST, id: [$anilistId]) {\n      id\n      slug\n      title {\n        romaji\n        english\n        native\n      }\n      themes {\n        id\n        sequence\n        slug\n        type\n        song {\n          title {\n            romaji\n            native\n          }\n          staff {\n            role\n            as\n            artist {\n              id\n              slug\n              name {\n                main\n              }\n            }\n          }\n        }\n        entries {\n          id\n          version\n          episodes\n          notes\n          nsfw\n          spoiler\n          videos {\n            nodes {\n              id\n              link\n              resolution\n              size\n              tags\n              nc\n              subbed\n              lyrics\n              overlap\n              source\n              mimetype\n              audio {\n                link\n                mimetype\n                size\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').AnimeThemesDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
