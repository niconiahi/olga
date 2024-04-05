import type { Env } from "~/utils/env"

export const PRODUCTION_ORIGIN = "https://olga.media"
export const DEVELOPMENT_ORIGIN = "http://localhost:8787"

export function getOrigin(env: Env) {
  return env.ENVIRONMENT === "development"
    ? DEVELOPMENT_ORIGIN
    : PRODUCTION_ORIGIN
}

