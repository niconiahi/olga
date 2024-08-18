import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Link, Outlet, useFetcher, useLoaderData, useLocation } from "@remix-run/react"
import { clsx } from "clsx"
import { useRef } from "react"

import { HamburgerIcon } from "~/components/icons/hamburger"
import { LoginIcon } from "~/components/icons/login"
import { LogoutIcon } from "~/components/icons/logout"
import { OlgaIcon } from "~/components/icons/olga"
import { validateSession } from "~/utils/auth"

export async function loader({
  request,
  context,
}: LoaderFunctionArgs) {
  const { user } = await validateSession(request, context)

  return { userId: user?.id }
}

export default function () {
  const { userId } = useLoaderData<typeof loader>()
  const logoRef = useRef<HTMLAnchorElement>(null)
  const rankingRef = useRef<HTMLAnchorElement>(null)
  const loginRef = useRef<HTMLAnchorElement>(null)
  const cutsRef = useRef<HTMLAnchorElement>(null)
  const location = useLocation()
  const fetcher = useFetcher()

  return (
    <>
      <header
        className={clsx([
          "pointer-events-none fixed left-0 right-0 flex items-center justify-between bg-transparent px-2 pt-2",
          ["/cuts/", "/"].includes(location.pathname)
            ? "md:pl-8 md:pr-7"
            : "md:px-8",
        ])}
      >
        <Link
          to="/"
          ref={logoRef}
          tabIndex={location.pathname === "/cuts/" ? -1 : 0}
          className={clsx([
            "pointer-events-auto flex items-center rounded-full border-2 border-solid border-brand-blue bg-brand-stone p-1.5 outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover",
            location.pathname === "/cuts"
            && "md:-translate-x-0.5 md:-translate-y-1 md:border-brand-red md:shadow-brandBlue md:transition-all md:duration-100",
          ])}
        >
          <OlgaIcon className="h-9" />
        </Link>
        <nav className="hidden w-max md:block">
          <ul className="flex flex-row items-center space-x-2">
            <li
              className={clsx("flex", [
                location.pathname === "/cuts/"
                && "-translate-x-0.5 -translate-y-1 transition-transform duration-100",
              ])}
            >
              <Link
                className={clsx([
                  "mabry pointer-events-auto border-2 border-solid border-brand-blue bg-brand-stone px-4 py-[15px] text-lg text-brand-blue outline-4 outline-offset-0 hover:bg-brand-blueHover focus-visible:outline focus-visible:outline-brand-red md:py-2.5",
                  location.pathname === "/cuts/"
                  && "border-brand-red text-brand-red shadow-brandBlue transition-shadow duration-100",
                ])}
                ref={cutsRef}
                tabIndex={location.pathname === "/cuts/" ? -1 : 0}
                to="/cuts"
              >
                Cortes
              </Link>
            </li>
            <li
              className={clsx("flex", [
                location.pathname === "/cuts/"
                && "-translate-x-0.5 -translate-y-1 transition-transform duration-100",
              ])}
            >
              <Link
                className={clsx([
                  "mabry pointer-events-auto border-2 border-solid border-brand-blue bg-brand-stone px-4 py-[15px] text-lg text-brand-blue outline-4 outline-offset-0 hover:bg-brand-blueHover focus-visible:outline focus-visible:outline-brand-red md:py-2.5",
                  location.pathname === "/cuts/"
                  && "border-brand-red text-brand-red shadow-brandBlue transition-shadow duration-100",
                ])}
                ref={cutsRef}
                tabIndex={location.pathname === "/cuts/" ? -1 : 0}
                to="/sounds"
              >
                Botonera
              </Link>
            </li>
            <li
              className={clsx("flex", [
                location.pathname === "/ranking/"
                && "-translate-x-0.5 -translate-y-1",
              ])}
            >
              <Link
                className={clsx([
                  "mabry pointer-events-auto border-2 border-solid border-brand-blue bg-brand-stone px-4 py-[15px] text-lg text-brand-blue outline-4 outline-offset-0 hover:bg-brand-blueHover focus-visible:outline focus-visible:outline-brand-red md:py-2.5",
                  location.pathname === "/ranking/"
                  && "border-brand-red text-brand-red shadow-brandBlue transition-shadow duration-100",
                ])}
                tabIndex={location.pathname === "/ranking/" ? -1 : 0}
                ref={rankingRef}
                to="/ranking"
              >
                Ranking
              </Link>
            </li>
            {userId
              ? (
                <li className="flex bg-red-500">
                  <fetcher.Form method="POST" action="/logout">
                    <button
                      aria-label="Logout"
                      type="submit"
                      className="pointer-events-auto border-2 border-solid border-brand-blue bg-brand-stone p-2 outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover"
                    >
                      <span className="sr-only">Logout</span>
                      <LogoutIcon className="fill-transparent h-8 text-brand-blue" />
                    </button>
                  </fetcher.Form>
                </li>
                )
              : (
                <li
                  className={clsx("flex", [
                    ["/login/", "/join/"].includes(
                      location.pathname,
                    ) && "-translate-x-0.5 -translate-y-1",
                  ])}
                >
                  <Link
                    to="/login"
                    ref={loginRef}
                    tabIndex={
                      ["/login/", "/join/"].includes(
                        location.pathname,
                      )
                        ? -1
                        : 0
                    }
                    className={clsx(
                      [
                        "pointer-events-auto border-2 border-solid border-brand-blue bg-brand-stone p-2 outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover",
                      ],
                      ["/login/", "/join/"].includes(
                        location.pathname,
                      )
                      && "border-brand-red shadow-brandBlue transition-shadow duration-100",
                    )}
                  >
                    <LoginIcon
                      className={clsx([
                        "h-8 text-brand-blue",
                        ["/login/", "/join/"].includes(
                          location.pathname,
                        ) && "text-brand-red",
                      ])}
                    />
                  </Link>
                </li>
                )}
          </ul>
        </nav>
        <nav className="pointer-events-auto md:hidden">
          <ul className="flex items-center space-x-2">
            {userId
              ? (
                <li className="flex">
                  <fetcher.Form method="POST" action="/logout">
                    <button
                      aria-label="Logout"
                      type="submit"
                      className="pointer-events-auto border-2 border-solid border-brand-blue bg-brand-stone p-2 outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover"
                    >
                      <span className="sr-only">Logout</span>
                      <LogoutIcon className="fill-transparent h-8 text-brand-blue" />
                    </button>
                  </fetcher.Form>
                </li>
                )
              : (
                <li className="flex">
                  <Link
                    to="/login"
                    className="border-2 border-solid border-brand-blue bg-brand-stone p-2 outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red md:hidden md:hover:bg-brand-blueHover"
                  >
                    <span className="sr-only">Login</span>
                    <LoginIcon className="h-8 text-brand-blue" />
                  </Link>
                </li>
                )}
            <li className="flex">
              <Link
                to="/navigate"
                className="border-2 border-solid border-brand-blue bg-brand-stone p-2 outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red md:hidden md:hover:bg-brand-blueHover"
              >
                <span className="sr-only">Menu</span>
                <HamburgerIcon className="h-8 text-brand-blue" />
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="mt-[60px] flex w-full flex-1 flex-col px-2 pb-3 pt-2 md:mx-auto md:max-w-3xl md:px-8 md:pb-8">
        <Outlet />
      </main>
    </>
  )
}
