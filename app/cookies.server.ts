import { createCookie } from "@remix-run/cloudflare"

export const googleStateCookie = createCookie("state", {
  maxAge: 60 * 60,
})
