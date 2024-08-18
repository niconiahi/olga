import * as v from "valibot"

export const ShowSchema = v.union([
  v.literal("sone-que-volaba"),
  v.literal("seria-increible"),
  v.literal("se-extrana-a-la-nona"),
  v.literal("generacion-dorada"),
  v.literal("cuando-eric-conocio-a-milton"),
  v.literal("paraiso-fiscal"),
  v.literal("mi-primo-es-asi"),
])
export type Show = v.Input<typeof ShowSchema>

export function getShow(title: string): string {
  const regex = /(ser[ií]a\sincre[ií]ble|so[ñn][eé]?\sque\svolaba|mi\sprimo\ses\sas[ií]|para[ií]so\sfiscal|se\sextra[ñn]a\sa\sla\snona|generaci[oó]n\sdorada|cuando\seric\sconoci[oó]\sa\smilton)/g
  const matches = title.toLocaleLowerCase().match(regex)

  if (!matches) {
    throw new Error("the \"title\" should contain the \"show\" name")
  }

  const match = matches[0].toLocaleLowerCase()
  if (match.includes("volaba")) {
    return "sone-que-volaba"
  }

  if (match.includes("incre")) {
    return "seria-increible"
  }

  if (match.includes("primo")) {
    return "mi-primo-es-asi"
  }

  if (match.includes("fiscal")) {
    return "paraiso-fiscal"
  }

  if (match.includes("nona")) {
    return "se-extrana-a-la-nona"
  }

  if (match.includes("dorada")) {
    return "generacion-dorada"
  }

  if (match.includes("milton")) {
    return "cuando-eric-conocio-a-milton"
  }

  throw new Error(`show title wasn't correctly captured`)
}

export async function getRaws(html: string, day: number, month: number) {
  const regex = /"videoId":"([^"]*?)".*?"text":"((?:[^"\\]|\\.)*)"/g
  const raws = [] as unknown[]
  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(html)) !== null) {
    const [, hash, title] = match
    if (title.includes(`${day}/${month}`)) {
      raws.push({
        hash,
        title: title.trim().replaceAll("\\", ""),
        show: getShow(title),
      })
    }
  }
  return raws
}

export const VideosSchema = v.array(
  v.object({
    hash: v.string([v.minLength(1, "Hash is required")]),
    show: ShowSchema,
    title: v.string([v.minLength(1, "Title is required")]),
  }),
)
export type Videos = v.Input<typeof VideosSchema>

export async function getVideos(day: number, month: number) {
  const url = `https://www.youtube.com/@olgaenvivo_/search?query=${day}%2F${month}`
  const res = await fetch(url)
  const html = await res.text()
  const raws = await getRaws(html, day, month)
  return v.safeParse(VideosSchema, raws)
}
