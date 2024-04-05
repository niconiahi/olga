import { generateCodeVerifier, generateState } from "arctic"
import { redirect } from "@remix-run/cloudflare"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { serializeCookie } from "oslo/cookie"
import { getEnv } from "~/utils/env"
import { createGoogleAuth, validateSession } from "~/utils/auth"

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = getEnv(context)
  const { session } = await validateSession(request)
  if (session)
    throw redirect("/")

  const googleAuth = createGoogleAuth(request)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email"],
  })
  throw redirect(url.toString(), {
    headers: {
      "Set-Cookie": serializeCookie("state", state, {
        httpOnly: true,
        secure: env.DB === "PRODUCTION",
        maxAge: 60 * 10,
        path: "/",
      }),
    },
  })
}
