import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import * as v from "valibot"

import { error } from "~/utils/http"
import { getQueryBuilder } from "~/utils/query-builder"

const BodySchema = v.object({
  cutId: v.coerce(v.number(), input => Number(input as string)),
  userId: v.string(),
})
export const UpvoteSchema = v.object({
  id: v.number(),
})
export const UpvotesSchema = v.array(
  v.object({
    start: v.string(),
    label: v.string(),
    date: v.string(),
    hash: v.string(),
    show: v.string(),
  }),
)
export type Upvotes = v.Output<typeof UpvotesSchema>

export async function action({ request, context }: LoaderFunctionArgs) {
  const data = await request.json()
  const result = v.safeParse(BodySchema, data)
  if (!result.success) {
    throw error(404, result.issues[0].message)
  }

  const { cutId, userId } = result.output

  const queryBuilder = getQueryBuilder(context)
  const { insertId } = await queryBuilder
    .insertInto("upvote")
    .values({
      cut_id: cutId,
      user_id: userId,
    })
    .executeTakeFirst()
  if (!insertId) {
    throw error(500, "there was an error while creating the upvote")
  }

  const upvote = await queryBuilder
    .selectFrom("upvote")
    .select("id")
    .where("id", "=", Number(insertId))
    .executeTakeFirst()
  if (!upvote) {
    throw error(400, `an error occurred while creating an "upvote"`)
  }

  return json(upvote)
}
