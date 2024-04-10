import * as v from "valibot"
import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { error } from "~/utils/http";
import { getQueryBuilder } from "~/utils/query-builder"
import { getVideos } from "~/utils/video"
import { dedupe, getCuts } from "~/utils/cut"

const ValuesSchema = v.object({
  day: v.coerce(v.number(), (input) => Number(input as string)),
  month: v.coerce(v.number(), (input) => Number(input as string)),
  year: v.coerce(v.number(), (input) => Number(input as string)),
})

const VideoSchema = v.object({
  hash: v.string(),
  title: v.string(),
  id: v.number()
})
const VideosSchema = v.array(VideoSchema)
export const ResponseSchema = v.object({
  addedVideos: VideosSchema,
  error: v.union([v.null_(), v.string()])
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
    return error(
      400,
      {
        error: valuesResult.issues[0].message,
        addedVideos: []
      }
    )
  }
  const { day, month, year } = valuesResult.output

  const queryBuilder = getQueryBuilder(context)
  const result = await getVideos(day, month)
  if (!result.success) {
    return error(
      400,
      {
        error: result.issues[0].message,
        addedVideos: []
      }
    )
  }

  const nextVideos = result.output
  if (nextVideos.length === 0) {
    return error(
      409,
      {
        error: "No se encontraron videos en este dia",
        addedVideos: []
      }
    )
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
    return error(
      409,
      {
        error: "Los videos de este dia ya fueron agregados",
        addedVideos: []
      }
    )
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
      return error(
        400,
        result.issues[0].message
      )
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

  return json({ error: null, addedVideos })
}
