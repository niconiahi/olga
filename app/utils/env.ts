import type { AppLoadContext } from "@remix-run/cloudflare"

export interface Env {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  ENVIRONMENT: string
  SOUNDS: R2Bucket
  DB: D1Database
}

export function getEnv(context: AppLoadContext): Env {
  return context.cloudflare.env
}
