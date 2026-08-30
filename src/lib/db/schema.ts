import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const libraryStatus = pgEnum("library_status", [
  "watching",
  "completed",
  "planning",
  "paused",
  "dropped",
  "rewatching",
])

export const animeEntries = pgTable(
  "anime_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    anilistId: integer("anilist_id").notNull(),
    status: libraryStatus("status").notNull().default("planning"),
    progress: integer("progress").notNull().default(0),
    totalEpisodes: integer("total_episodes"),
    score: integer("score"),
    rewatchCount: integer("rewatch_count").notNull().default(0),
    favorite: boolean("favorite").notNull().default(false),
    private: boolean("private").notNull().default(false),
    notes: text("notes"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("anime_entries_user_anilist_unique").on(
      table.userId,
      table.anilistId
    ),
    index("anime_entries_user_status_index").on(table.userId, table.status),
    index("anime_entries_user_updated_index").on(table.userId, table.updatedAt),
    index("anime_entries_user_private_index").on(table.userId, table.private),
  ]
)

export const episodeProgress = pgTable(
  "episode_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => animeEntries.id, { onDelete: "cascade" }),
    episode: integer("episode").notNull(),
    note: text("note"),
    favorite: boolean("favorite").notNull().default(false),
    watchedAt: timestamp("watched_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("episode_progress_entry_episode_unique").on(
      table.entryId,
      table.episode
    ),
  ]
)

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    coverColor: text("cover_color"),
    private: boolean("private").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("collections_user_index").on(table.userId)]
)

export const collectionEntries = pgTable(
  "collection_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => animeEntries.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("collection_entries_collection_entry_unique").on(
      table.collectionId,
      table.entryId
    ),
    index("collection_entries_entry_id_index").on(table.entryId),
  ]
)

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: text("user_id").primaryKey(),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    bio: text("bio"),
    isPublic: boolean("is_public").notNull().default(true),
    anilistUsername: text("anilist_username"),
    malUsername: text("mal_username"),
    pinnedAnimeIds: integer("pinned_anime_ids").array(),
    favoriteGenres: text("favorite_genres").array(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_profiles_handle_unique").on(table.handle)]
)

export type AnimeEntry = typeof animeEntries.$inferSelect
export type NewAnimeEntry = typeof animeEntries.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert
export type Collection = typeof collections.$inferSelect
export type CollectionEntry = typeof collectionEntries.$inferSelect
export type EpisodeProgress = typeof episodeProgress.$inferSelect
