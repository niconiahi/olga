import clsx from "clsx"
import type { Cuts } from "~/routes/cut.get.all"
import { CutsSchema } from "~/routes/cut.get.all"
import { HeartIcon } from "~/components/icons/heart"
import { getSeconds } from "~/utils/cut"
import { Show, ShowSchema } from "~/utils/video"
import { getDay, getMonth } from "~/utils/date"
import { validateSession } from "~/utils/auth"
import { ShowIcon } from "~/components/icons/show-icon"
import { LoaderFunctionArgs, defer } from "@remix-run/cloudflare"
import * as v from "valibot"
import { error } from "~/utils/http"
import { Form, useFetcher, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { UpvotesSchema } from "~/routes/upvote.get.$userId"

const cutsByDaySchema = v.array(
  v.tuple([
    v.coerce(
      v.date(),
      (input) => new Date(input as string)
    ),
    v.array(
      v.tuple([ShowSchema, CutsSchema])
    )
  ]),
)

export async function loader({
  request, context
}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const query = searchParams.get("query")
  const { user } = await validateSession(request, context)

  const cutsResult = v.safeParse(
    CutsSchema,
    await (await fetch(`${url.origin}/cut/get/all`)).json()
  )
  if (!cutsResult.success) {
    throw error(400, cutsResult.issues[0].message)
  }
  const cuts = cutsResult.output

  const upvotesResult = v.safeParse(
    UpvotesSchema,
    user
      ? await (await fetch(`${url.origin}/upvote/get/${user.id}`)).json()
      : []
  )
  if (!upvotesResult.success) {
    throw error(400, upvotesResult.issues[0].message)
  }
  const upvotes = upvotesResult.output

  const cutsByDay = Object.entries(
    cuts
      .filter((cut) => {
        return query
          ? cut.label
            .toLocaleLowerCase()
            .replaceAll("á", "a")
            .replaceAll("é", "e")
            .replaceAll("í", "i")
            .replaceAll("ó", "o")
            .replaceAll("ú", "u")
            .includes(
              query
                .toLocaleLowerCase()
                .replaceAll("á", "a")
                .replaceAll("é", "e")
                .replaceAll("í", "i")
                .replaceAll("ó", "o")
                .replaceAll("ú", "u"),
            )
          : true
      })
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

  const _result = v.safeParse(cutsByDaySchema, cutsByDay)
  if (!_result.success) {
    throw error(400, _result.issues[0].message)
  }

  return defer({
    cutsByDay: _result.output,
    userId: user?.id,
    query,
    upvotes,
  })
}

export default function() {
  const { cutsByDay: _cutsByDay, query: initialQuery, userId, upvotes } = useLoaderData<typeof loader>()
  const [query, setQuery] = useState<string>(initialQuery ?? '')
  const cutsByDay = v.parse(cutsByDaySchema, _cutsByDay)

  return (
    <>
      <section>
        <Form
          reloadDocument
          className="flex w-full items-center justify-between border-2 border-brand-red"
        >
          <p className="w-full px-2">
            <label htmlFor="query" className="sr-only">
              Buscar por titulo
            </label>
            <input
              value={query ?? undefined}
              onChange={(event) => {
                setQuery(String(event.target.value))
              }}
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
      </section>
      <section className="mt-2 flex">
        <ul className="w-full grow space-y-2">
          {cutsByDay
            .slice()
            .reverse()
            .map(([date, cuts], index) => {
              return (
                <li key={`date-${date.toISOString()}`} className="space-y-2">
                  <h4
                    className={clsx([
                      "bebas text-3xl uppercase leading-none text-brand-red",
                      index > 0 ? "mt-3" : "mt-0",
                    ])}
                  >
                    {`${getDay(date)}/${getMonth(date)}`}
                  </h4>
                  <ul className="space-y-3">
                    {cuts.map(([show, cuts]) => {
                      return (
                        <li
                          key={`show-${date}-${show}`}
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
                            {cuts
                              .map((cut) => {
                                return {
                                  ...cut,
                                  isUpvoted:
                                    upvotes.some(({ cut_id }) => {
                                      return cut_id === cut.id
                                    })
                                }
                              })
                              .map(({ label, start, hash, id, isUpvoted }) => {
                                return (
                                  <Heart
                                    id={id}
                                    hash={hash}
                                    isUpvoted={isUpvoted}
                                    start={start}
                                    label={label}
                                    userId={userId}
                                    show={show}
                                  />
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
  id
}: {
  show: Show,
  hash: string,
  start: string,
  label: string,
  isUpvoted: boolean,
  userId: string | undefined,
  id: number
}) {
  const fetcher = useFetcher()
  const isRequesting = fetcher.state === 'submitting' || fetcher.state === 'loading'
  console.log("isRequesting", isRequesting)

  return (
    <li
      key={`cut-${show}-${hash}-${getSeconds(start)}-${id}`}
      className="flex items-start space-x-2 py-0.5"
    >
      <a
        className={clsx([
          "flex w-full items-start justify-between space-x-2 px-0.5 font-medium md:hover:cursor-pointer",
          `outline-4 focus-visible:outline  `,
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
      </a>
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
              isUpvoted && isRequesting && "fill-gray-200 text-gray-400",
              !isUpvoted && isRequesting && "text-gray-300"
            ])}
          />
        </button>
      </fetcher.Form>
    </li>
  )
}
