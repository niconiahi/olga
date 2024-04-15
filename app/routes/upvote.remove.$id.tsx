import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import * as v from "valibot"
import { error } from "~/utils/http"
import { getQueryBuilder } from "~/utils/query-builder"

const UpvoteSchema = v.object({
  cutId: v.coerce(v.number(), input => Number(input as string)),
  userId: v.string(),
})
export const UpvotesSchema = v.array(
  v.object({
    start: v.string(),
    label: v.string(),
    day: v.number(),
    hash: v.string(),
    month: v.number(),
    show: v.string(),
  }),
)
export type Upvotes = v.Input<typeof UpvotesSchema>

export async function action({ request, context }: ActionFunctionArgs) {
  const data = await request.json()
  const result = v.safeParse(UpvoteSchema, data)
  if (!result.success)
    throw error(400, result.issues[0].message)

  const { cutId, userId } = result.output

  const queryBuilder = getQueryBuilder(context)
  const upvote = await queryBuilder
    .selectFrom("upvote")
    .select("id")
    .where("cut_id", "=", cutId)
    .where("user_id", "=", userId)
    .executeTakeFirst()

  if (!upvote?.id) {
    throw error(
      400,
      `there is no "upvote" that matches the one requested to delete. Please check the values of "cutId" and "userId"`,
    )
  }

  await queryBuilder
    .deleteFrom("upvote")
    .where("id", "=", upvote.id)
    .executeTakeFirst()

  return json(upvote)
}
