import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getEnv } from "~/utils/env";
import { error } from "~/utils/http";
import * as v from "valibot"

const ParamsSchema = v.object({
  soundKey: v.string()
})

export async function loader({ context, params: _params }: LoaderFunctionArgs) {
  const paramsResult = v.safeParse(ParamsSchema, _params)
  if (!paramsResult.success) {
    throw error(400, paramsResult.issues[0].message)
  }
  const params = paramsResult.output

  const env = getEnv(context)
  const sound = await env.SOUNDS.get(params.soundKey)
  if (sound === null) {
    throw error(404, 'Not found');
  }
  const blob = await sound.blob()

  return new Response(blob, {
    headers: {
      "Content-Type": "application/octet-stream"
    }
  })
}
