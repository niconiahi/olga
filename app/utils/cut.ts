import * as v from "valibot"

function getSafeStart(start: string) {
  const pieces = start.replaceAll("\\n", "").split(":")
  return pieces
    .map((digit, i) => {
      if (pieces.length === 3 && i === 0)
        return digit.startsWith("0") ? digit.replace("0", "") : digit

      if (pieces.length === 2 && i === 0)
        return digit.padStart(2, "0")

      return digit.padEnd(2, "0")
    })
    .join(":")
}

export const cutsSchema = v.array(
  v.object({
    start: v.string(),
    label: v.string(),
    videoId: v.number(),
  }),
)
export type Cuts = v.Input<typeof cutsSchema>
export function getRaws(html: string, videoId: number): unknown[] {
  const raws = [] as unknown[]
  const regex
    = /(\\n\d{1,2}:\d{2}(?::\d{1,2})?)\s(.*?)(?=\\n\d{1,2}:\d{2}(?::\d{1,2})?|\\n\\n|$)/g
  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(html)) !== null) {
    const [, start, label] = match
    raws.push({
      start: getSafeStart(start),
      label: label.trim().replaceAll("\\", ""),
      videoId,
    })
  }
  return raws
}

export function dedupe(cuts: Cuts) {
  const { start } = cuts[0]
  const index = cuts.slice(1, cuts.length).findIndex((cut) => {
    return cut.start === start
  })
  return cuts.slice(0, index + 1)
}

// the "start" comes in the form of "d{1,2}:d{1,2}:d{1,2}"
export function getSeconds(start: string) {
  const parts = start.split(":").map(Number)
  let seconds = 0
  if (parts.length === 3) {
    seconds += parts[0] * 3600
    seconds += parts[1] * 60
    seconds += parts[2]
  } else if (parts.length === 2) {
    seconds += parts[0] * 60
    seconds += parts[1]
  } else if (parts.length === 1) {
    seconds = parts[0]
  }
  return seconds
}

export async function getCuts(hash: string, videoId: number) {
  const url = `https://www.youtube.com/watch?v=${hash}`
  const res = await fetch(url)
  const html = await res.text()
  const raws = getRaws(html, videoId)
  return v.safeParse(cutsSchema, raws)
}

