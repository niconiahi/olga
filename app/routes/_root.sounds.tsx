import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  return json({ origin: url.origin })
}

export default function() {
  const { origin } = useLoaderData<typeof loader>()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch(`${origin}/sound/get/dudoso.mp3`)
      .then((response) => {
        return response.blob()
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const audioElement = audioRef.current
        if (audioElement) {
          audioElement.src = objectUrl
        }
      })
  }, [])

  return (
    <figure>
      <figcaption>Dudoso</figcaption>
      <audio ref={audioRef} controls src="."></audio>
    </figure>
  )
}
