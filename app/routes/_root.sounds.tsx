import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getEnv } from "~/utils/env";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = getEnv(context)
  const sounds = await env.SOUNDS.list()
  console.log('sounds', sounds)
  const dudoso = await env.SOUNDS.get("dudoso.p3")
  console.log('dudoso', dudoso)


  return null
}

export default function() {
  return (
    <h1>sounds</h1>
  )
}
