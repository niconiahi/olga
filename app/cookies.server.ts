import type { AppLoadContext } from "@remix-run/cloudflare"
import { createCookie } from "@remix-run/cloudflare"

import { getEnv } from "./utils/env"

export function getStateCookie(context: AppLoadContext) {
  const env = getEnv(context)
  const secure = env.ENVIRONMENT === "production"
  return createCookie("state", {
    httpOnly: true,
    secure,
    maxAge: 60 * 10,
    path: "/",
  })
}

export function getCodeVerifierCookie(context: AppLoadContext) {
  const env = getEnv(context)
  const secure = env.ENVIRONMENT === "production"
  return createCookie("code_verifier", {
    httpOnly: true,
    secure,
    maxAge: 60 * 10,
    path: "/",
  })
}
