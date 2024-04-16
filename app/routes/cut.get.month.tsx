import * as v from "valibot"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getQueryBuilder } from "~/utils/query-builder"
import { error } from "~/utils/http"
import { DAYS } from "~/generated/days"
import { DateSchema } from "~/utils/date"

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

export async function loader({
  context,
  request
}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const queryBuilder = getQueryBuilder(context)

  let month = searchParams.get('month')
  if (!month) {
    throw error(400, 'month search param is required')
  }

  let year = searchParams.get('year')
  if (!year) {
    throw error(400, 'month search param is required')
  }

  const _lastDate = DAYS
    .toSorted()
    .reverse()
    .find((day) => getCurrentMonthFirstMatch(year, month, day))
  const lastDate = v.parse(DateSchema, _lastDate)

  const _firstDate = DAYS
    .toSorted()
    .find((day) => getCurrentMonthFirstMatch(year, month, day))
  const firstDate = v.parse(DateSchema, _firstDate)

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
    .where((eb) =>
      eb("video.date", "<", lastDate.toISOString())
        .and("video.date", ">", firstDate.toISOString())
    )
    .execute()

  return json(cuts, {
    headers: {
      "Cache-Control": `s-maxage=${60 * 5}, stale-while-revalidate=${60 * 60 * 24 * 7}`,
    },
  })
}

function getCurrentMonthFirstMatch(year: string, month: string, day: string) {
  return day.startsWith(`${year}-${month}`)
}
