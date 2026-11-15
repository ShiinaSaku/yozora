/**
 * gql.tada instance for the AnimeThemes GraphQL schema (see
 * ./themes-env.d.ts, generated from schemas/animethemes.graphql).
 *
 * The live AnimeThemes endpoint blocks non-browser fetchers, so the schema
 * snapshot is committed instead of fetched remotely.
 */
import { initGraphQLTada } from "gql.tada"
import type { introspection } from "./themes-env.d.ts"

export const graphql = initGraphQLTada<{
  introspection: introspection
}>()

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada"
