import clsx from "clsx"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import * as v from "valibot"
import { useLoaderData } from "@remix-run/react"
import type { Cuts } from "~/routes/cut.get.ranking"
import { CutsSchema } from "~/routes/cut.get.ranking"
import { getSeconds } from "~/utils/cut"
import { ShowSchema } from "~/utils/video"
import { ShowIcon } from "~/components/icons/show-icon"
import { error } from "~/utils/http"

const CutsByShowSchema = v.array(
  v.tuple([ShowSchema, CutsSchema]),
)

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const raws = await (await fetch(`${url.origin}/cut/get/ranking`)).json()
  const result = v.safeParse(CutsSchema, raws)
  if (!result.success)
    throw error(400, result.issues[0].message)

  const cuts = result.output

  const cutsByShow = Object.entries(
    cuts.reduce<{ [show: string]: Cuts }>((prevShows, cut) => {
      const { show } = cut

      return {
        ...prevShows,
        [show]: prevShows[show] ? [...prevShows[show], cut] : [cut],
      }
    }, {}),
  )
  const _result = v.safeParse(CutsByShowSchema, cutsByShow)
  if (!_result.success)
    throw error(400, _result.issues[0].message)

  return { cutsByShow: _result.output }
}

export default function () {
  const { cutsByShow } = useLoaderData<typeof loader>()

  return (
    <section className="flex h-full flex-1 flex-col items-start justify-center space-y-2">
      <h2 className="mabry text-3xl uppercase leading-none text-brand-red">
        Top 50
      </h2>
      <ul className="w-full grow space-y-2">
        {cutsByShow.map(([show, cuts]) => {
          return (
            <li
              key={`show-${show}`}
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
                {cuts.map(({ label, start, hash, upvotes }) => {
                  return (
                    <li
                      key={`cut-${show}-${hash}-${start}`}
                      className="flex items-start py-0.5"
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
                      </a>
                      <div className="flex items-center justify-end">
                        <span className="mabry min-w-fit px-1 text-brand-blue">
                          {Array.from(String(upvotes)).map((number, index) => (
                            <span
                              key={`number-${show}-${hash}-${start}-${number}-${index}`}
                              aria-hidden="true"
                              className={clsx([
                                "aabry border-2 border-b-4 border-solid px-1 py-0.5",
                                show === "seria-increible" && `border-show-seriaIncreible-primary text-show-seriaIncreible-primary`,
                                show === "sone-que-volaba" && `border-show-soneQueVolaba-primary text-show-soneQueVolaba-primary`,
                                show === "paraiso-fiscal" && `border-show-paraisoFiscal-primary text-show-paraisoFiscal-primary`,
                                show === "se-extrana-a-la-nona" && `border-show-seExtranaALaNona-primary text-show-seExtranaALaNona-primary`,
                                show === "generacion-dorada" && `border-show-generacionDorada-primary text-show-generacionDorada-primary`,
                                show === "cuando-eric-conocio-a-milton" && `border-show-cuandoEricConocioAMilton-primary text-show-cuandoEricConocioAMilton-primary`,
                                show === "mi-primo-es-asi" && `border-show-miPrimoEsAsi-primary text-show-miPrimoEsAsi-primary`,
                              ])}
                            >
                              {number}
                            </span>
                          ))}
                          <span className="sr-only">
                            {upvotes}
                            {" "}
                            votos
                          </span>
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
