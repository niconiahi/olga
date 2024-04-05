import type { AppLoadContext } from "@remix-run/cloudflare"
import type { DB } from "~/generated/db"
import { Kysely } from "kysely"
import { D1Dialect } from "kysely-d1"
import { getEnv } from "~/utils/env"

export function getDatabase(context: AppLoadContext) {
  const env = getEnv(context)
  const db = new Kysely<DB>({
    dialect: new D1Dialect({ database: env.DB }),
  })
  return db
}
