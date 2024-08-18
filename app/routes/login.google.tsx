import { redirect } from "@remix-run/cloudflare"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { generateCodeVerifier, generateState } from "arctic"

import { getCodeVerifierCookie, getStateCookie } from "~/cookies.server"
import { createGoogleAuth, validateSession } from "~/utils/auth"

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { session } = await validateSession(request, context)
  if (session) {
    throw redirect("/")
  }

  const googleAuth = createGoogleAuth(context)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email"],
  })
  const headers = new Headers()
  const stateCookie = getStateCookie(context)
  const codeVerifierCookie = getCodeVerifierCookie(context)
  headers.append("Set-Cookie", await stateCookie.serialize(state))
  headers.append("Set-Cookie", await codeVerifierCookie.serialize(codeVerifier))
  throw redirect(url.toString(), {
    headers,
  })
}
