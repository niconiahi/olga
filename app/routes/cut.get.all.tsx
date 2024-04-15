import * as v from "valibot"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getQueryBuilder } from "~/utils/query-builder"

export const CutsSchema = v.array(
  v.object({
    id: v.number(),
    start: v.string(),
    label: v.string(),
    hash: v.string(),
    date: v.string(),
    show: v.string(),
  }),
)

export type Cuts = v.Output<typeof CutsSchema>

export async function loader({ context }: LoaderFunctionArgs) {
  const queryBuilder = getQueryBuilder(context)
  const cuts = await queryBuilder
    .selectFrom("cut")
    .innerJoin("video", "video.id", "cut.video_id")
    .select([
      "video.date",
      "video.hash",
      "video.show",
      "cut.id",
      "cut.label",
      "cut.start",
    ])
    .execute()

  return json(cuts, {
    headers: {
      "Cache-Control": `s-maxage=${60 * 5}, stale-while-revalidate=${60 * 60 * 24 * 7}`,
    },
  })
}
