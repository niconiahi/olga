import { OAuth2RequestError } from "arctic"
import { generateId } from "lucia"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import * as v from "valibot"
import { getQueryBuilder } from "~/utils/query-builder"
import { createGoogleAuth, getAuth, validateSession } from "~/utils/auth"
import { getCodeVerifierCookie, getStateCookie } from "~/cookies.server"
import { error } from "~/utils/http"

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context)
  await validateSession(request, context)
  const googleAuth = createGoogleAuth(context)
  const cookieHeader = request.headers.get("Cookie")
  const stateCookie = getStateCookie(context)
  const storedState = await stateCookie.parse(cookieHeader)
  const codeVerifierCookie = getCodeVerifierCookie(context)
  const storedCodeVerifier = await codeVerifierCookie.parse(cookieHeader)
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !storedState || !storedCodeVerifier || state !== storedState || typeof storedCodeVerifier !== "string")
    throw error(400, `expected Google's states to match but the don't`)

  const tokens = await googleAuth.validateAuthorizationCode(code, storedCodeVerifier)
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  })
    .then(response => response.json())
    .catch((e) => {
      if (e instanceof OAuth2RequestError) {
        throw new Response(`invalid code`, {
          status: 400,
        })
      }
    })
  const GoogleUserSchema = v.object({
    sub: v.string(),
    email: v.string(),
  })
  const user = v.parse(GoogleUserSchema, response)

  const queryBuilder = getQueryBuilder(context)
  const existingUser = await queryBuilder
    .selectFrom("user")
    .select(["user.id"])
    .where("user.sub", "=", user.sub)
    .executeTakeFirst()

  if (existingUser) {
    const session = await auth.createSession(existingUser.id, {})
    const sessionCookie = auth.createSessionCookie(session.id)
    const headers = new Headers()
    headers.append("Set-Cookie", sessionCookie.serialize())
    return redirect("/", { headers })
  }

  const userId = generateId(15)
  await queryBuilder
    .insertInto("user")
    .values({
      id: userId,
      sub: user.sub,
      email: user.email,
    })
    .executeTakeFirst()
  const session = await auth.createSession(userId, {})
  const sessionCookie = auth.createSessionCookie(session.id)
  const headers = new Headers()
  headers.append("Set-Cookie", sessionCookie.serialize())
  return redirect("/", { headers })
}
