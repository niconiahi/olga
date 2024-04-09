import { D1Adapter } from "@lucia-auth/adapter-sqlite"
import { AppLoadContext } from "@remix-run/cloudflare"
import { Google } from "arctic"
import { Lucia, verifyRequestOrigin } from "lucia"
import { getEnv } from "~/utils/env"
import { getOrigin } from "~/utils/routes"

export function getAuth(context: AppLoadContext) {
  const env = getEnv(context)
  const adapter = new D1Adapter(env.DB, {
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
  })
  return auth
}

type Auth = ReturnType<typeof getAuth>

declare module "lucia" {
  interface Register {
    Auth: Auth
  }
}

export function createGoogleAuth(context: AppLoadContext) {
  const env = getEnv(context)
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${getOrigin(env)}/login/google/callback`,
  )
}

export async function validateSession(
  request: Request,
  context: AppLoadContext
) {
  const env = getEnv(context)
  const auth = getAuth(context)

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

  const cookieHeader = request.headers.get("Cookie")
  const sessionId = auth.readSessionCookie(cookieHeader ?? "")
  console.log("sessionId", sessionId)
  if (!sessionId) {
    return {
      session: null,
      user: null,
    }
  }

  const headers = new Headers()
  const { session, user } = await auth.validateSession(sessionId)
  console.log("session", session)
  console.log("user", user)
  if (!session) {
    const sessionCookie = auth.createBlankSessionCookie()
    headers.append("Set-Cookie", sessionCookie.serialize())
  }
  if (session && session.fresh) {
    const sessionCookie = auth.createSessionCookie(session.id)
    headers.append("Set-Cookie", sessionCookie.serialize())
  }

  return { session, user }
}
