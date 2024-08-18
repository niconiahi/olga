import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { sql } from "kysely"
import * as v from "valibot"

import { getQueryBuilder } from "~/utils/query-builder"

export const CutsSchema = v.array(
  v.object({
    start: v.string(),
    label: v.string(),
    hash: v.string(),
    show: v.string(),
    upvotes: v.number(),
  }),
)
export type Cuts = v.Output<typeof CutsSchema>

export async function loader({ context }: LoaderFunctionArgs) {
  const queryBuilder = getQueryBuilder(context)
  const cuts = await queryBuilder
    .selectFrom("cut")
    .innerJoin("video", "video.id", "cut.video_id")
    .innerJoin("upvote", "upvote.cut_id", "cut.id")
    .select([
      "video.hash",
      "video.show",
      "cut.label",
      "cut.start",
      sql<number>`COUNT(upvote.id)`.as("upvotes"),
    ])
    .groupBy("cut.id")
    .orderBy("upvotes", "desc")
    .limit(50)
    .execute()

  return json(cuts)
}
