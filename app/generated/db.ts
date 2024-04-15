import type { ColumnType } from "kysely"

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export interface _CfKV {
  key: string
  value: Buffer | null
}

export interface Cut {
  id: Generated<number>
  label: string
  start: string
  video_id: number
}

export interface D1Migrations {
  applied_at: Generated<string>
  id: Generated<number | null>
  name: string | null
}

export interface Session {
  expires_at: number
  id: string
  user_id: string
}

export interface Upvote {
  cut_id: number
  id: Generated<number>
  user_id: string
}

export interface User {
  email: string
  id: string
  sub: string
}

export interface Video {
  created_at: Generated<string | null>
  date: string
  hash: string
  id: Generated<number>
  show: string
  title: string
  updated_at: string | null
}

export interface DB {
  _cf_KV: _CfKV
  cut: Cut
  d1_migrations: D1Migrations
  session: Session
  upvote: Upvote
  user: User
  video: Video
}
