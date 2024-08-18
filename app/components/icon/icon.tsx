import { clsx } from "clsx"
import type { SVGProps } from "react"
import { twMerge } from "tailwind-merge"

import type { IconName } from "~/components/icon/name"
import href from "~/components/icon/sprite.svg"

export { href }
export { IconName }

export function Icon({
  name,
  className,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName
}) {
  return (
    <svg
      {...props}
      className={twMerge(clsx("inline self-center", className))}
    >
      <use href={`${href}#${name}`} />
    </svg>
  )
}
