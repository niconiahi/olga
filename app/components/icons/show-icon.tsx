import { CuandoEricConocioAMiltonIcon } from "~/components/icons/cuando-eric-conocio-a-milton"
import { GeneracionDoradaIcon } from "~/components/icons/generacion-dorada"
import { MiPrimoEsAsiIcon } from "~/components/icons/mi-primo-es-asi"
import { ParaisoFiscalIcon } from "~/components/icons/paraiso-fiscal"
import { SeExtranaALaNonaIcon } from "~/components/icons/se-extrana-a-la-nona"
import { SeriaIncreibleIcon } from "~/components/icons/seria-increible"
import { SoneQueVolabaIcon } from "~/components/icons/sone-que-volaba"
import type { Show } from "~/utils/video"

export function ShowIcon({ show, className }: { show: Show, className: string }) {
  if (show === "seria-increible") {
    return <SeriaIncreibleIcon className={className} />
  }

  if (show === "sone-que-volaba") {
    return <SoneQueVolabaIcon className={className} />
  }

  if (show === "paraiso-fiscal") {
    return <ParaisoFiscalIcon className={className} />
  }

  if (show === "mi-primo-es-asi") {
    return <MiPrimoEsAsiIcon className={className} />
  }

  if (show === "generacion-dorada") {
    return <GeneracionDoradaIcon className={className} />
  }

  if (show === "se-extrana-a-la-nona") {
    return <SeExtranaALaNonaIcon className={className} />
  }

  if (show === "cuando-eric-conocio-a-milton") {
    return <CuandoEricConocioAMiltonIcon className={className} />
  }

  return null
}
