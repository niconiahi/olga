import * as v from "valibot"
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { fail } from "~/utils/http";
import { getQueryBuilder } from "~/utils/query-builder"
import { getVideos } from "~/utils/video"
import { dedupe, getCuts } from "~/utils/cut"

const ValuesSchema = v.object({
  day: v.coerce(v.number(), (input) => Number(input as string)),
  month: v.coerce(v.number(), (input) => Number(input as string)),
  year: v.coerce(v.number(), (input) => Number(input as string)),
})

export async function action({
  request,
  context
}: ActionFunctionArgs) {
  const formData = await request.formData()
  const valuesResult = v.safeParse(ValuesSchema, {
    day: formData.get("day"),
    month: formData.get("month"),
    year: formData.get("year"),
  })
  if (!valuesResult.success) {
    throw fail(400, {
      success: false,
      error: valuesResult.issues[0].message
    })
  }
  const { day, month, year } = valuesResult.output

  const queryBuilder = getQueryBuilder(context)
  const result = await getVideos(day, month)
  if (!result.success) {
    return fail(400, {
      success: false,
      error: result.issues[0].message
    })
  }

  const nextVideos = result.output
  if (nextVideos.length === 0) {
    return fail(409, {
      success: false,
      error: "No se encontraron videos en este dia",
    })
  }

  const prevVideos = await queryBuilder
    .selectFrom("video")
    .select(["hash"])
    .where(eb => eb.or(nextVideos.map(({ hash }) => eb("hash", "=", hash))))
    .execute()

  const videos = nextVideos.filter(
    ({ hash }) => !prevVideos.some(prevVideo => prevVideo.hash === hash),
  )
  if (videos.length === 0) {
    return fail(409, {
      success: false,
      error: "Los videos de este dia ya fueron agregados",
    })
  }

  await queryBuilder
    .insertInto("video")
    .values(
      videos.map(({ hash, title, show }) => ({
        title,
        hash,
        date: new Date(`${year}-${month}-${day}`).toISOString(),
        show,
      })),
    )
    .execute()

  const addedVideos = await queryBuilder
    .selectFrom("video")
    .select(["title", "id", "hash"])
    .where(eb => eb.or(videos.map(({ hash }) => eb("hash", "=", hash))))
    .execute()


  for (const { hash, id } of addedVideos) {
    const result = await getCuts(hash, id)
    if (!result.success) {
      return fail(400, {
        success: false, error: result.issues[0].message
      })
    }

    const cuts = dedupe(result.output)
    const CHUNK_SIZE = 20
    for (let i = 0; i < cuts.length; i += CHUNK_SIZE) {
      const chunk = cuts.slice(i, i + CHUNK_SIZE)

      await queryBuilder
        .insertInto("cut")
        .values(
          chunk.map(({ label, start, videoId }) => ({
            label,
            start,
            video_id: videoId,
          })),
        )
        .execute()
    }
  }

  return json({ success: true, addedVideos })
}
