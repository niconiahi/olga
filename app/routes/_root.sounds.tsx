import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getEnv } from "~/utils/env";
import * as v from "valibot"

const SoundSchema = v.object({
  key: v.string()
})
type Sound = v.Output<typeof SoundSchema>

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const env = getEnv(context)
  const _sounds = await env.SOUNDS.list()
  const sounds = _sounds.objects.map((_sound) => ({ key: _sound.key }))
  return json({ sounds, origin: url.origin })
}

export default function() {
  const { origin, sounds } = useLoaderData<typeof loader>()

  return (
    <ul className="grid grid-cols-1">
      {sounds.map((sound) => {
        return (
          <Button sound={sound} origin={origin} key={`sound-${sound.key}`} />
        )
      })}
    </ul>
  )
}

function Button({
  sound, origin
}: {
  sound: Sound,
  origin: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { key } = sound

  useEffect(() => {
    fetch(`${origin}/sound/get/${key}`)
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
    <figure className="p-1.5 border-solid border-2 border-brand-blue">
      <figcaption
        className="mabry uppercase text-brand-blue"
      >{key.replace('.mp3', '')}</figcaption>
      <audio
        className=""
        ref={audioRef}
        controls
        controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
        src="."
      ></audio>
    </figure>
  )
}
