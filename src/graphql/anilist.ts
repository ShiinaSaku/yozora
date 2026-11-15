/**
 * gql.tada instance for the AniList GraphQL schema (see ./anilist-env.d.ts,
 * generated from ./schema.graphql by the gql.tada ts-plugin / CLI).
 *
 * Types are resolved at compile time — there is no codegen step. Queries
 * written with `graphql(...)` here are checked against the schema in the
 * editor and infer their exact result and variable types.
 */
import { initGraphQLTada } from "gql.tada"
import type { introspection } from "./anilist-env.d.ts"

export const graphql = initGraphQLTada<{
  introspection: introspection
}>()

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada"
