import type { RequestEventBase } from "@builder.io/qwik-city"
import { D1Adapter } from "@lucia-auth/adapter-sqlite"
import { Google } from "arctic"
import { Lucia, verifyRequestOrigin } from "lucia"
import { getDatabase } from "~/utils/database"
import { getEnv } from "~/utils/env"
import { getOrigin } from "~/utils/routes"

export function getAuth(requestEvent: RequestEventBase) {
  const { env: envGetter, platform } = requestEvent
  const database = getDatabase(platform)
  const env = getEnv(envGetter)
  const adapter = new D1Adapter(database, {
    user: "user",
    session: "session",
  })
  const auth = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: env.ENVIRONMENT === "production",
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
      }
    },
  })
  return auth
}

type Auth = ReturnType<typeof getAuth>

declare module "lucia" {
  interface DatabaseUserAttributes {
    email: string
  }
  interface Register {
    Auth: Auth
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

export function createGoogleAuth(requestEvent: RequestEventBase) {
  const { env: envGetter } = requestEvent
  const env = getEnv(envGetter)
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${getOrigin(env)}/login/google/callback`,
  )
}

export async function validateSession(requestEvent: RequestEventBase) {
  const { cookie, env: envGetter, request } = requestEvent
  const env = getEnv(envGetter)
  const auth = getAuth(requestEvent)

  //  NOTE: CSRF protection
  const originHeader = request.headers.get("Origin")
  const hostHeader = request.headers.get("Host")
  if (
    env.ENVIRONMENT === "production"
    && (!originHeader
      || !hostHeader
      || !verifyRequestOrigin(originHeader, [hostHeader]))
  ) {
    throw new Response(null, {
      status: 403,
    })
  }

  const sessionId = cookie.get(auth.sessionCookieName)
  if (!sessionId) {
    return {
      session: null,
      user: null,
    }
  }

  const headers = new Headers()

  const { session, user } = await auth.validateSession(sessionId.value)
  if (!session) {
    const sessionCookie = auth.createBlankSessionCookie()
    headers.append("Set-Cookie", sessionCookie.serialize())
    cookie.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )
  }

  if (session && session.fresh) {
    const sessionCookie = auth.createSessionCookie(session.id)
    headers.append("Set-Cookie", sessionCookie.serialize())
    cookie.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )
  }

  return { session, user }
}
