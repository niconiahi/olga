import clsx from "clsx"
import type { ActionFunctionArgs, AppLoadContext, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { defer } from "@remix-run/cloudflare"
import * as v from "valibot"
import { Await, Form, redirect, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react"
import type { ReactNode } from "react"
import { Suspense, useEffect, useState } from "react"
import type { Cuts } from "~/routes/cut.get.all"
import { CutsSchema } from "~/routes/cut.get.all"
import { HeartIcon } from "~/components/icons/heart"
import { getSeconds } from "~/utils/cut"
import type { Show } from "~/utils/video"
import { ShowSchema } from "~/utils/video"
import { DateSchema, getDay, getMonth, getYear } from "~/utils/date"
import { validateSession } from "~/utils/auth"
import { ShowIcon } from "~/components/icons/show-icon"
import { error } from "~/utils/http"
import { UpvotesSchema } from "~/routes/upvote.get.$userId"
import { getQueryBuilder } from "~/utils/query-builder"
import { DAYS } from "~/generated/days"

export const ACTION = {
  query: "query" as const,
  setMonth: "setMonth" as const,
  setYear: "setYear" as const,
  nextMonth: "nextMonth" as const,
  clearQuery: "clearQuery" as const,
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  let action = formData.get("_action");
  if (!action) {
    throw error(400, "action is required")
  }

  switch (action) {
    case ACTION.clearQuery: {
      const searchParams = new URLSearchParams()
      const month = v.parse(v.string(), formData.get('month'))
      const year = v.parse(v.string(), formData.get('year'))
      searchParams.set('month', month)
      searchParams.set('year', year)
      return redirect(`/cuts?${searchParams.toString()}`)
    }
    case ACTION.query: {
      const searchParams = new URLSearchParams()
      const month = v.parse(v.string(), formData.get('month'))
      const year = v.parse(v.string(), formData.get('year'))
      const query = v.parse(v.string(), formData.get('query'))
      searchParams.set('month', month)
      searchParams.set('year', year)
      searchParams.set('query', query)
      return redirect(`/cuts?${searchParams.toString()}`)
    }
    case ACTION.setMonth: {
      const searchParams = new URLSearchParams()
      const month = v.parse(v.string(), formData.get('month'))
      const year = v.parse(v.string(), formData.get('year'))
      searchParams.set('month', month)
      searchParams.set('year', year)
      return redirect(`/cuts?${searchParams.toString()}`)
    }
    case ACTION.setYear: {
      const searchParams = new URLSearchParams()
      const month = v.parse(v.string(), formData.get('month'))
      const year = v.parse(v.string(), formData.get('year'))
      searchParams.set('month', month)
      searchParams.set('year', year)
      return redirect(`/cuts?${searchParams.toString()}`)
    }
    case ACTION.nextMonth: {
      const searchParams = new URLSearchParams()
      const month = v.parse(v.string(), formData.get('month'))
      const year = v.parse(v.string(), formData.get('year'))

      const nextDateResult = v.safeParse(
        DateSchema,
        DAYS.find((day) => {
          return getNextMonthFirstMatch(year, month, day)
        })
      )
      if (!nextDateResult.success) {
        throw error(400, 'new month is expected when setting it')
      }
      const nextDate = nextDateResult.output

      searchParams.set('month', getMonth(nextDate))
      searchParams.set('year', getYear(nextDate))

      return redirect(`/cuts?${searchParams.toString()}`)
    }
  }
}

const cutsByDaySchema = v.array(
  v.tuple([
    v.coerce(
      v.date(),
      input => new Date(input as string),
    ),
    v.array(
      v.tuple([ShowSchema, CutsSchema]),
    ),
  ]),
)

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const query = searchParams.get("query")

  let month = searchParams.get("month")
  let year = searchParams.get("year")
  if (!month || !year) {
    const date = await getLastCutDate(context)
    const searchParams = new URLSearchParams()
    searchParams.set('month', getMonth(date))
    searchParams.set('year', getYear(date))
    throw redirect(`/cuts?${searchParams.toString()}`)
  }

  const { user } = await validateSession(request, context)

  const upvotes
    = user
      ? fetch(`${url.origin}/upvote/get/${user.id}`).then(raw => raw.json())
      : new Promise(resolve => resolve([]))

  const cutsResult = v.safeParse(
    CutsSchema,
    await (await fetch(query
      ? `${url.origin}/cut/get/all`
      : `${url.origin}/cut/get/month?month=${month}&year=${year}`)).json(),
  )
  if (!cutsResult.success) {
    throw error(400, cutsResult.issues[0].message)
  }
  const cuts = cutsResult.output

  return defer({
    cuts,
    url: url.toString(),
    userId: user?.id,
    query,
    upvotes,
  })
}

const YEARS = ['2023', '2024']
const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export default function() {
  const { cuts: initialCuts, query, userId, upvotes, url: _url } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof loader>()
  const [searchParams] = useSearchParams()
  const [cuts, setCuts] = useState<Cuts>(initialCuts)

  useEffect(() => {
    if (fetcher.data) {
      setCuts(cuts)
    }
  }, [fetcher.data])

  const cutsByDay = v.parse(
    cutsByDaySchema,
    getCutsByDay(filterByQuery(cuts, query))
  )

  return (
    <>
      <section className={clsx([
        "grid grid-cols-2 grid-rows-2 gap-2",
        query && "grid-rows-1"
      ])}>
        <Form
          method="POST"
          reloadDocument
          className="flex w-full items-center justify-between border-2 border-brand-red col-span-2"
        >
          <input
            type="hidden"
            name="_action"
            value={ACTION.query}
          />
          <input
            type="hidden"
            name="year"
            defaultValue={searchParams.get('year') ?? undefined}
          />
          <input
            type="hidden"
            name="month"
            defaultValue={searchParams.get('month') ?? undefined}
          />
          <p className="w-full px-2">
            <label htmlFor="query" className="sr-only">
              Buscar por titulo
            </label>
            <input
              defaultValue={query ?? undefined}
              className="mabry w-full bg-transparent px-1 text-brand-blue outline-4 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-redHover"
              type="text"
              id="query"
              name="query"
            />
          </p>
          <button
            className="mabry border-l-2 border-brand-red bg-transparent px-4 py-2 text-2xl text-brand-red outline-4 outline-offset-0 transition-colors duration-100 focus-visible:border-l-0 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-red md:hover:text-brand-stone"
            type="submit"
          >
            Buscar
          </button>
        </Form>
        {query ? (
          <Form
            method="POST"
            reloadDocument
            className="flex w-full items-center justify-center border-2 border-brand-red col-span-2"
          >
            <input
              type="hidden"
              name="_action"
              value={ACTION.clearQuery}
            />
            <input
              type="hidden"
              name="year"
              defaultValue={searchParams.get('year') ?? undefined}
            />
            <input
              type="hidden"
              name="month"
              defaultValue={searchParams.get('month') ?? undefined}
            />
            <button
              className="mabry border-brand-red bg-transparent px-4 py-2 text-2xl text-brand-red outline-4 outline-offset-0 transition-colors duration-100 focus-visible:border-l-0 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-red md:hover:text-brand-stone"
              type="submit"
            >
              Limpiar filtro
            </button>
          </Form>
        ) : null}
        {!query ? (
          <Form>
            <input
              type="hidden"
              name="_action"
              value={ACTION.setYear}
            />
            <input
              type="hidden"
              name="month"
              defaultValue={searchParams.get('month') ?? undefined}
            />
            <select
              defaultValue={searchParams.get('year') ?? undefined}
              className="mabry border-2 border-brand-red bg-transparent px-4 py-2 text-2xl text-brand-red outline-4 outline-offset-0 transition-colors duration-100 focus-visible:border-l-0 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-red md:hover:text-brand-stone h-full w-full"
              name="year"
              onChange={(event) => {
                (event.target.parentElement as HTMLFormElement).submit()
              }}
            >
              {YEARS.map((year) => {
                return (
                  <option key={`year-option-${year}`} value={year}>{year}</option>
                )
              })}
            </select>
          </Form>
        ) : null}
        {!query ? (
          <Form action="/cuts" method="POST">
            <input
              type="hidden"
              name="_action"
              value={ACTION.setMonth}
            />
            <input
              type="hidden"
              name="year"
              defaultValue={searchParams.get('year') ?? undefined}
            />
            <select
              defaultValue={searchParams.get('month') ?? undefined}
              className="mabry border-2 border-brand-red bg-transparent px-4 py-2 text-2xl text-brand-red outline-4 outline-offset-0 transition-colors duration-100 focus-visible:border-l-0 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-red md:hover:text-brand-stone h-full w-full"
              name="month"
              onChange={(event) => {
                (event.target.parentElement as HTMLFormElement).submit()
              }}
            >
              {MONTHS.map((month) => {
                const value = month.padStart(2, "0")
                return (
                  <option key={`month-option-${month}`} value={value}>{month}</option>
                )
              })}
            </select>
          </Form>
        ) : null}
      </section>
      <section className="mt-6 flex flex-col space-y-7">
        <ul className="w-full grow space-y-6">
          {cutsByDay
            .reverse()
            .map(([date, cutsByDay], index) => {
              return (
                <li key={`date-${date.toISOString()}`} className="space-y-2">
                  <h4
                    className={clsx([
                      "mabry text-2xl uppercase leading-none text-brand-red",
                      index > 0 ? "mt-3" : "mt-0",
                    ])}
                  >
                    {`${getDay(date)}/${getMonth(date)}`}
                  </h4>
                  <ul className="space-y-3">
                    {cutsByDay.map(([show, cuts]) => {
                      return (
                        <li
                          key={`show-${date.toISOString()}-${show}`}
                          className={clsx([
                            "mr-0.5 space-y-2 border-2 p-2",
                            show === "seria-increible" && `border-show-seriaIncreible-primary shadow-seriaIncreible`,
                            show === "sone-que-volaba" && `border-show-soneQueVolaba-primary shadow-soneQueVolaba`,
                            show === "paraiso-fiscal" && `border-show-paraisoFiscal-primary shadow-paraisoFiscal`,
                            show === "se-extrana-a-la-nona" && `border-show-seExtranaALaNona-primary shadow-seExtranaALaNona`,
                            show === "generacion-dorada" && `border-show-generacionDorada-primary shadow-generacionDorada`,
                            show === "cuando-eric-conocio-a-milton" && `border-show-cuandoEricConocioAMilton-primary shadow-cuandoEricConocioAMilton`,
                            show === "mi-primo-es-asi" && `border-show-miPrimoEsAsi-primary shadow-miPrimoEsAsi`,
                          ])}
                        >
                          <ShowIcon show={show} className="h-12" />
                          <ul>
                            {cuts.map(({ label, start, hash, id }) => {
                              return (
                                <Suspense
                                  key={`cut-${show}-${hash}-${getSeconds(start)}-${id}`}
                                  fallback={(
                                    <HeartFallback
                                      id={id}
                                      hash={hash}
                                      start={start}
                                      label={label}
                                      userId={userId}
                                      show={show}
                                    />
                                  )}
                                >
                                  <Await resolve={upvotes}>
                                    {(_upvotes) => {
                                      const upvotesResult = v.safeParse(
                                        UpvotesSchema,
                                        _upvotes,
                                      )
                                      if (!upvotesResult.success)
                                        throw error(400, upvotesResult.issues[0].message)

                                      const upvotes = upvotesResult.output

                                      return (
                                        <Heart
                                          id={id}
                                          hash={hash}
                                          isUpvoted={upvotes.some(({ cut_id }) => {
                                            return cut_id === id
                                          })}
                                          start={start}
                                          label={label}
                                          userId={userId}
                                          show={show}
                                        />
                                      )
                                    }}
                                  </Await>
                                </Suspense>
                              )
                            })}
                          </ul>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
        </ul>
        {!query ? (
          <Form action="/cuts" method="POST" reloadDocument>
            <input
              type="hidden"
              name="_action"
              value={ACTION.nextMonth}
            />
            <input
              type="hidden"
              name="year"
              defaultValue={searchParams.get('year') ?? undefined}
            />
            <input
              type="hidden"
              name="month"
              defaultValue={searchParams.get('month') ?? undefined}
            />
            <button
              className="mabry border-2 border-brand-red bg-transparent px-4 py-2 text-2xl text-brand-red outline-4 outline-offset-0 transition-colors duration-100 focus-visible:border-l-0 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-red md:hover:text-brand-stone h-full w-full"
              type='submit'
            >
              Mes anterior
            </button>
          </Form>
        ) : null}
        {query ? (
          <Form
            method="POST"
            reloadDocument
            className="flex w-full items-center justify-center border-2 border-brand-red col-span-2"
          >
            <input
              type="hidden"
              name="_action"
              value={ACTION.clearQuery}
            />
            <input
              type="hidden"
              name="year"
              defaultValue={searchParams.get('year') ?? undefined}
            />
            <input
              type="hidden"
              name="month"
              defaultValue={searchParams.get('month') ?? undefined}
            />
            <button
              className="mabry border-brand-red bg-transparent px-4 py-2 text-2xl text-brand-red outline-4 outline-offset-0 transition-colors duration-100 focus-visible:border-l-0 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-red md:hover:text-brand-stone"
              type="submit"
            >
              Limpiar filtro
            </button>
          </Form>
        ) : null}
      </section>
    </>
  )
}

function Heart({
  show,
  hash,
  start,
  label,
  isUpvoted,
  userId,
  id,
}: {
  show: Show
  hash: string
  start: string
  label: string
  isUpvoted: boolean
  userId: string | undefined
  id: number
}) {
  const fetcher = useFetcher({ key: `upvote-${id}` })
  const isRequesting = fetcher.state === "submitting" || fetcher.state === "loading"

  return (
    <li className="flex items-start space-x-2 py-0.5">
      <HeartLink start={start} show={show} hash={hash}>
        <HeartLabel show={show} label={label} />
        <HeartStart start={start} show={show} />
      </HeartLink>
      <fetcher.Form
        action="/upvote/add"
        method="POST"
        className="flex"
      >
        <span className="sr-only">
          {isUpvoted
            ? "Quitar voto de este corte"
            : "Votar este corte para el ranking"}
        </span>
        <input
          type="hidden"
          name="isUpvoted"
          value={isUpvoted ? "true" : "false"}
        />
        <input
          type="hidden"
          name="cutId"
          value={id}
        />
        <input
          type="hidden"
          name="userId"
          value={userId}
        />
        <button
          type="submit"
          disabled={isRequesting}
          className={clsx([
            "outline-4 focus-visible:outline disabled:cursor-wait",
            show === "seria-increible" && `outline-show-seriaIncreible-primary`,
            show === "sone-que-volaba" && `outline-show-soneQueVolaba-primary`,
            show === "paraiso-fiscal" && `outline-show-paraisoFiscal-primary`,
            show === "se-extrana-a-la-nona" && `outline-show-seExtranaALaNona-primary`,
            show === "generacion-dorada" && `outline-show-generacionDorada-primary`,
            show === "cuando-eric-conocio-a-milton" && `outline-show-cuandoEricConocioAMilton-primary`,
            show === "mi-primo-es-asi" && `outline-show-miPrimoEsAsi-primary`,
          ])}
          aria-label={
            isUpvoted
              ? "Quitar voto de este corte"
              : "Votar este corte para el ranking"
          }
          aria-pressed={isUpvoted}
        >
          {isRequesting
            ? (
              <HeartIcon className="h-6 w-7 fill-gray-300 text-gray-500" />
            )
            : (
              <HeartIcon
                className={clsx([
                  "h-6 w-7",
                  isUpvoted && show === "seria-increible" && `fill-show-seriaIncreible-primaryHover text-show-seriaIncreible-primary`,
                  isUpvoted && show === "sone-que-volaba" && `fill-show-soneQueVolaba-primaryHover text-show-soneQueVolaba-primary`,
                  isUpvoted && show === "paraiso-fiscal" && `fill-show-paraisoFiscal-primaryHover text-show-paraisoFiscal-primary`,
                  isUpvoted && show === "se-extrana-a-la-nona" && `fill-show-seExtranaALaNona-primaryHover text-show-seExtranaALaNona-primary`,
                  isUpvoted && show === "generacion-dorada" && `fill-show-generacionDorada-primaryHover text-show-generacionDorada-primary`,
                  isUpvoted && show === "cuando-eric-conocio-a-milton" && `fill-show-cuandoEricConocioAMilton-primaryHover text-show-cuandoEricConocioAMilton-primary`,
                  isUpvoted && show === "mi-primo-es-asi" && `fill-show-miPrimoEsAsi-primaryHover text-show-miPrimoEsAsi-primary`,
                  !isUpvoted && show === "seria-increible" && `fill-transparent text-show-seriaIncreible-primaryHover`,
                  !isUpvoted && show === "sone-que-volaba" && `fill-transparent text-show-soneQueVolaba-primaryHover`,
                  !isUpvoted && show === "paraiso-fiscal" && `fill-transparent text-show-paraisoFiscal-primaryHover`,
                  !isUpvoted && show === "se-extrana-a-la-nona" && `fill-transparent text-show-seExtranaALaNona-primaryHover`,
                  !isUpvoted && show === "generacion-dorada" && `fill-transparent text-show-generacionDorada-primaryHover`,
                  !isUpvoted && show === "cuando-eric-conocio-a-milton" && `fill-transparent text-show-cuandoEricConocioAMilton-primaryHover`,
                  !isUpvoted && show === "mi-primo-es-asi" && `fill-transparent text-show-miPrimoEsAsi-primaryHover`,
                ])}
              />
            )}
        </button>
      </fetcher.Form>
    </li>
  )
}

function HeartFallback({
  show,
  hash,
  start,
  label,
  userId,
  id,
}: {
  show: Show
  hash: string
  start: string
  label: string
  userId: string | undefined
  id: number
},
) {
  return (
    <li className="flex items-start space-x-2 py-0.5">
      <HeartLink start={start} show={show} hash={hash}>
        <HeartLabel show={show} label={label} />
        <HeartStart start={start} show={show} />
      </HeartLink>
      <Form
        action="/upvote/add"
        method="POST"
        className="flex"
      >
        <span className="sr-only">
          Votar este corte para el ranking
        </span>
        <input
          type="hidden"
          name="isUpvoted"
          value="false"
        />
        <input
          type="hidden"
          name="cutId"
          value={id}
        />
        <input
          type="hidden"
          name="userId"
          value={userId}
        />
        <button
          type="submit"
          disabled={true}
          className={clsx([
            "outline-4 focus-visible:outline disabled:cursor-wait",
            show === "seria-increible" && `outline-show-seriaIncreible-primary`,
            show === "sone-que-volaba" && `outline-show-soneQueVolaba-primary`,
            show === "paraiso-fiscal" && `outline-show-paraisoFiscal-primary`,
            show === "se-extrana-a-la-nona" && `outline-show-seExtranaALaNona-primary`,
            show === "generacion-dorada" && `outline-show-generacionDorada-primary`,
            show === "cuando-eric-conocio-a-milton" && `outline-show-cuandoEricConocioAMilton-primary`,
            show === "mi-primo-es-asi" && `outline-show-miPrimoEsAsi-primary`,
          ])}
          aria-label="Votar este corte para el ranking"
          aria-pressed={false}
        >
          <HeartIcon
            className={clsx([
              "h-6 w-7",
              show === "seria-increible" && `fill-transparent text-show-seriaIncreible-primaryHover`,
              show === "sone-que-volaba" && `fill-transparent text-show-soneQueVolaba-primaryHover`,
              show === "paraiso-fiscal" && `fill-transparent text-show-paraisoFiscal-primaryHover`,
              show === "se-extrana-a-la-nona" && `fill-transparent text-show-seExtranaALaNona-primaryHover`,
              show === "generacion-dorada" && `fill-transparent text-show-generacionDorada-primaryHover`,
              show === "cuando-eric-conocio-a-milton" && `fill-transparent text-show-cuandoEricConocioAMilton-primaryHover`,
              show === "mi-primo-es-asi" && `fill-transparent text-show-miPrimoEsAsi-primaryHover`,
            ])}
          />
        </button>
      </Form>
    </li>
  )
}

function HeartStart({
  show,
  start,
}: {
  show: Show
  start: string
}) {
  return (
    <span
      className={clsx([
        "mabry",
        show === "seria-increible" && `text-show-seriaIncreible-primary`,
        show === "sone-que-volaba" && `text-show-soneQueVolaba-primary`,
        show === "paraiso-fiscal" && `text-show-paraisoFiscal-primary`,
        show === "se-extrana-a-la-nona" && `text-show-seExtranaALaNona-primary`,
        show === "generacion-dorada" && `text-show-generacionDorada-primary`,
        show === "cuando-eric-conocio-a-milton" && `text-show-cuandoEricConocioAMilton-primary`,
        show === "mi-primo-es-asi" && `text-show-miPrimoEsAsi-primary `,
      ])}
    >
      {start}
    </span>
  )
}

function HeartLabel({
  show,
  label,
}: {
  show: Show
  label: string
}) {
  return (

    <span
      className={clsx([
        "mabry",
        show === "seria-increible" && `text-show-seriaIncreible-primary`,
        show === "sone-que-volaba" && `text-show-soneQueVolaba-primary`,
        show === "paraiso-fiscal" && `text-show-paraisoFiscal-primary`,
        show === "se-extrana-a-la-nona" && `text-show-seExtranaALaNona-primary`,
        show === "generacion-dorada" && `text-show-generacionDorada-primary`,
        show === "cuando-eric-conocio-a-milton" && `text-show-cuandoEricConocioAMilton-primary`,
        show === "mi-primo-es-asi" && `text-show-miPrimoEsAsi-primary `,
      ])}
    >
      {label}
    </span>
  )
}

function HeartLink(
  {
    show,
    hash,
    start,
    children,
  }: {
    show: Show
    hash: string
    start: string
    children?: ReactNode
  },
) {
  return (
    <a
      className={clsx([
        "flex w-full items-start justify-between space-x-2 px-0.5 font-medium md:hover:cursor-pointer",
        `outline-4 focus-visible:outline`,
        show === "seria-increible" && `focus-visible:outline-show-seriaIncreible-primary md:hover:bg-show-seriaIncreible-primaryHover`,
        show === "sone-que-volaba" && `focus-visible:outline-show-soneQueVolaba-primary md:hover:bg-show-soneQueVolaba-primaryHover`,
        show === "paraiso-fiscal" && `focus-visible:outline-show-paraisoFiscal-primary md:hover:bg-show-paraisoFiscal-primaryHover`,
        show === "se-extrana-a-la-nona" && `focus-visible:outline-show-seExtranaALaNona-primary md:hover:bg-show-seExtranaALaNona-primaryHover`,
        show === "generacion-dorada" && `focus-visible:outline-show-generacionDorada-primary md:hover:bg-show-generacionDorada-primaryHover`,
        show === "cuando-eric-conocio-a-milton" && `focus-visible:outline-show-cuandoEricConocioAMilton-primary md:hover:bg-show-cuandoEricConocioAMilton-primaryHover`,
        show === "mi-primo-es-asi" && `focus-visible:outline-show-miPrimoEsAsi-primary md:hover:bg-show-miPrimoEsAsi-primaryHover`,
      ])}
      target="_blank"
      href={
        `https://www.youtube.com/watch?v=${hash}`
        + `&t=${getSeconds(start)}`
      }
    >
      {children}
    </a>
  )
}

function removeAccents(text: string) {
  return text
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
}

function getCutsByDay(cuts: Cuts) {
  return Object.entries(
    cuts
      .reduce<{
        [day: string]: { [show: string]: Cuts }
      }>((prevDays, cut) => {
        const { show, date } = cut
        return {
          ...prevDays,
          [date]: prevDays[date]
            ? {
              ...prevDays[date],
              [show]: prevDays[date][show]
                ? [...prevDays[date][show], cut]
                : [cut],
            }
            : {
              [show]: [cut],
            },
        }
      }, {}),
  )
    .sort(([a], [b]) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })
    .map((day) => {
      return [day[0], Object.entries(day[1])]
    })
}

function filterByQuery(cuts: Cuts, query: string | null) {
  return cuts.filter((cut) => {
    return query
      ? removeAccents(cut.label).toLocaleLowerCase().includes(
        removeAccents(query).toLocaleLowerCase()
      )
      : true
  })
}

async function getLastCutDate(context: AppLoadContext) {
  const queryBuilder = getQueryBuilder(context)
  const lastCut = await queryBuilder
    .selectFrom('cut')
    .innerJoin("video", "video.id", "cut.video_id")
    .select(["video.date"])
    .orderBy("video.date", "desc")
    .limit(1)
    .executeTakeFirst()
  if (!lastCut) {
    throw error(400, 'there are no cuts yet. Please, ad one')
  }
  const last = lastCut.date

  const date = v.parse(DateSchema, last)

  return date
}

function getNextMonthFirstMatch(year: string, month: string, day: string) {
  if (month.padStart(2, "0") === '01') {
    const nextYear = Number(year) - 1
    return day.startsWith(`${nextYear}-12`)
  }

  const nextMonth = String(Number(month) - 1).padStart(2, "0")
  return day.startsWith(`${year}-${nextMonth}`)
}
