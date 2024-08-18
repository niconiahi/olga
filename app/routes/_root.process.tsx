import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { Form, json, useLoaderData, useSearchParams } from "@remix-run/react"
import { useEffect, useState } from "react"
import * as v from "valibot"

import { DAYS } from "~/generated/days"
import type { Videos } from "~/routes/cut.add"
import { ResponseSchema } from "~/routes/cut.add"
import { getDay, getMonth, getYear } from "~/utils/date"
import { error } from "~/utils/http"

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)

  return json({ url: url.toString() })
}

const ValuesSchema = v.object({
  day: v.coerce(v.number(), input => Number(input as string)),
  month: v.coerce(v.number(), input => Number(input as string)),
  year: v.coerce(v.number(), input => Number(input as string)),
  start: v.union([v.string(), v.undefined_()]),
})

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData()
  const valuesResult = v.safeParse(ValuesSchema, {
    day: formData.get("day"),
    month: formData.get("month"),
    year: formData.get("year"),
    start: formData.get("start") ?? undefined,
  })
  if (!valuesResult.success) {
    return error(
      400,
      {
        error: valuesResult.issues[0].message,
        addedVideos: [],
      },
    )
  }
  const { day, month, year, start } = valuesResult.output
  const url = new URL(request.url)
  const searchParams = url.searchParams
  if (!start) {
    const startIndex = DAYS.findIndex((_day) => {
      return _day === `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    })
    if (startIndex === -1) {
      throw error(400, "this day is not on the list of days")
    }

    searchParams.set("start", String(startIndex))
  } else {
    searchParams.set("start", start)
    const endIndex = DAYS.findIndex((_day) => {
      return _day === `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    })
    if (endIndex === -1) {
      throw error(400, "this day is not on the list of days")
    }

    searchParams.set("end", String(endIndex))
  }
  return redirect(url.toString())
}

export default function () {
  const { url } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!start || !end) {
    return (
      <DayForm start={start} />
    )
  }

  return (
    <Process start={Number(start)} end={Number(end)} url={url} />
  )
}

function DayForm({
  start,
}: {
  start: string | null
}) {
  return (
    <section className="flex h-full flex-1 flex-col items-center justify-center space-y-2">
      <Form
        method="POST"
        action="/process"
        className="w-80 space-y-2"
      >
        <input
          type="hidden"
          name="start"
          value={start ?? undefined}
        />

        <p className="flex flex-col space-y-1">
          <label className="mabry leading-none text-brand-blue" htmlFor="day">
            Dia
          </label>
          <input
            required
            className="mabry border-2 border-brand-blue bg-brand-stone px-1 py-3 text-brand-blue outline-4 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover"
            type="number"
            id="day"
            name="day"
            aria-errormessage="day-error"
          />
        </p>
        <p className="flex flex-col space-y-1">
          <label className="mabry leading-none text-brand-blue" htmlFor="month">
            Mes
          </label>
          <input
            required
            className="mabry border-2 border-brand-blue bg-brand-stone px-1 py-3 text-brand-blue outline-4 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover"
            type="number"
            id="month"
            name="month"
          />
        </p>
        <p className="flex flex-col space-y-1">
          <label className="mabry leading-none text-brand-blue" htmlFor="year">
            Año
          </label>
          <input
            required
            className="mabry border-2 border-brand-blue bg-brand-stone px-1 py-3 text-brand-blue outline-4 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover"
            type="number"
            id="year"
            name="year"
          />
        </p>
        <button
          type="submit"
          className="mabry w-full border-2 text-brand-stone border-brand-red bg-brand-red px-4 py-2 text-2xl text-brand-red outline-4 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-stone md:hover:text-brand-red"
        >
          {start ? "Hasta este dia" : "Desde este dia"}
        </button>
      </Form>
    </section>
  )
}

function Process({
  start,
  end,
  url: _url,
}: {
  start: number
  end: number
  url: string
}) {
  const [videos, setVideos] = useState<Videos>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const current = Number(searchParams.get("current") ?? start)

  useEffect(() => {
    async function run() {
      if (current > end) {
        return
      }

      const next = DAYS[current + 1]
      const date = new Date(next)
      const day = getDay(date)
      const month = getMonth(date)
      const year = getYear(date)

      const formData = new FormData()
      formData.append("day", day)
      formData.append("month", month)
      formData.append("year", year)

      const url = new URL(_url)
      const {
        error: errorMessage,
        addedVideos,
      } = await fetch(`${url.origin}/cut/add`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          return response.json()
        })
        .then((json) => {
          return v.parse(ResponseSchema, json)
        })
      if (errorMessage) {
        console.error(errorMessage)
      }

      setVideos(prevVideos => [...prevVideos, ...addedVideos])
      setSearchParams((prevSearchParams) => {
        prevSearchParams.set("current", String(Number(current) + 1))
        return prevSearchParams
      })
    }

    run()
  }, [current])

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, [videos, current, searchParams])

  // TODO: add tests for these day's indexes in DAYS
  // 1
  // 2
  // 3
  // 6
  // 7
  // 8
  // 94
  // 184
  // 254
  // 255
  // 274
  // 349
  return (
    <section>
      <ul className="space-y-2">
        {videos.map(({ title, id }) => (
          <li className="p-2 border-solid border-2 border-brand-blue bg-brand-blueHover" key={`video-${title}-${id}`}>{title}</li>
        ))}
      </ul>
    </section>
  )
}
