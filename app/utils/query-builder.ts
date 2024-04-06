import { AppLoadContext } from "@remix-run/cloudflare"
import { Kysely } from "kysely"
import { D1Dialect } from "kysely-d1"
import { DB } from "~/generated/db"
import { getEnv } from "./env"

export function getQueryBuilder(context: AppLoadContext) {
  const env = getEnv(context)
  return new Kysely<DB>({
    dialect: new D1Dialect({ database: env.DB }),
  })
}
