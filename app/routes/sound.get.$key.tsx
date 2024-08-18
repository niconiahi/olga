import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import * as v from "valibot"

import { getEnv } from "~/utils/env"
import { error } from "~/utils/http"

const ParamsSchema = v.object({
  key: v.string(),
})

export async function loader({ context, params: _params }: LoaderFunctionArgs) {
  const paramsResult = v.safeParse(ParamsSchema, _params)
  if (!paramsResult.success) {
    throw error(400, paramsResult.issues[0].message)
  }

  const params = paramsResult.output

  const env = getEnv(context)
  const sound = await env.SOUNDS.get(params.key)
  if (sound === null) {
    throw error(404, "Not found")
  }

  const blob = await sound.blob()

  return new Response(blob, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  })
}
