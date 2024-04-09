import { getQueryBuilder } from "~/utils/query-builder"
import * as v from "valibot"
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare"
import { error } from "~/utils/http"

const UserIdSchema = v.string()
export const UpvotesSchema = v.array(
  v.object({
    cut_id: v.number(),
    id: v.number(),
    user_id: v.string(),
  }),
)

export type Upvotes = v.Input<typeof UpvotesSchema>

export async function loader({
  context,
  params
}: LoaderFunctionArgs) {
  console.log("starting loading upvote get all")

  const _userId = params.userId
  console.log("_userId", _userId)
  const userIdResult = v.safeParse(
    UserIdSchema,
    _userId
  )
  if (!userIdResult.success) {
    throw error(500, userIdResult.issues[0].message)
  }
  const userId = userIdResult.output
  console.log("upvote.get.userid => userId", userId)

  const queryBuilder = getQueryBuilder(context)
  const upvotes = await queryBuilder
    .selectFrom("upvote")
    .selectAll()
    .where("user_id", "=", userId)
    .execute()
  console.log("upvotes", upvotes)

  return json(upvotes)
}
