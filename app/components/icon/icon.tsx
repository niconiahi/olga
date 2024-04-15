
import { type SVGProps } from "react";
import type { IconName } from "~/components/icon/name";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import href from "~/components/icon/sprite.svg";

export { href };
export { IconName };

export function Icon({
  name,
  className,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
}) {
  return (
    <svg
      {...props}
      className={twMerge(clsx("inline self-center", className))}
    >
      <use href={`${href}#${name}`} />
    </svg>
  );
}

