import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare"
import * as v from "valibot"
import { error } from "~/utils/http"

const ValuesSchema = v.object({
  cutId: v.string(),
  isUpvoted: v.union([v.literal("true"), v.literal("false")]),
  userId: v.union([v.string(), v.undefined_()]),
})

export const UpvoteSchema = v.object({
  id: v.number(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const valuesResult = v.safeParse(ValuesSchema, {
    cutId: formData.get("cutId"),
    isUpvoted: formData.get("isUpvoted"),
    userId: formData.get("userId"),
  })
  if (!valuesResult.success) {
    return error(400, JSON.stringify({
      success: false,
      error: valuesResult.issues[0].message
    }))
  }
  const { cutId, userId, isUpvoted } = valuesResult.output

  if (!userId) {
    throw redirect(`/login`)
  }

  const url = new URL(request.url)

  if (isUpvoted === "true") {
    const data = await (
      await fetch(`${url.origin}/upvote/remove/[id]`, {
        method: "DELETE",
        body: JSON.stringify({ userId, cutId }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json()
    const result = v.safeParse(UpvoteSchema, data)
    if (!result.success) {
      return error(
        404,
        `the expected structure of the removed "upvote" is incorrect`,
      )
    }
    const upvote = result.output

    return upvote
  } else {
    const data = await (
      await fetch(`${url.origin}/upvote/create/[id]`, {
        method: "POST",
        body: JSON.stringify({ userId, cutId }),
      })
    ).json()
    const result = v.safeParse(UpvoteSchema, data)
    if (!result.success) {
      return error(
        404,
        `the expected structure of the created "upvote" is incorrect`,
      )
    }
    const upvote = result.output

    return upvote
  }
}

