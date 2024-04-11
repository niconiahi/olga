import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getEnv } from "~/utils/env";
import { error } from "~/utils/http";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = getEnv(context)
  const sound = await env.SOUNDS.get("dudoso.mp3")
  if (sound === null) {
    return error(404, 'Not found');
  }
  return new Response(sound.body)
}

export default function() {
  const loaderData = useLoaderData<typeof loader>()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    async function createObjectUrl() {
      console.log()
      const response = new Response(loaderData as ReadableStream)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      return url
    }

    createObjectUrl().then((objectUrl) => {
      console.log("objectUrl", objectUrl)
      const audioElement = audioRef.current
      if (audioElement) {
        audioElement.src = objectUrl
        audioElement.addEventListener("canplaythrough", () => {
          audioElement.play();
        });
      }
    })

  }, [loaderData])

  return (
    <figure>
      <figcaption>Listen to the T-Rex:</figcaption>
      <audio ref={audioRef} controls src="."></audio>
    </figure>
  )
}
