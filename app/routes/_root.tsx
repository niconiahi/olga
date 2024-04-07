import { useEffect, useRef } from "react"
import { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Link, Outlet, useFetcher, useLoaderData, useLocation } from "@remix-run/react"
import { validateSession } from "~/utils/auth"
import { clsx } from "clsx"
import { LogoutIcon } from "~/components/icons/logout"
import { LoginIcon } from "~/components/icons/login"

export async function loader({
  request, context
}: LoaderFunctionArgs) {
  const { user } = await validateSession(request, context)

  return { userId: user?.id }
}

export default function() {
  const { userId } = useLoaderData<typeof loader>()
  const logoRef = useRef<HTMLInputElement>(null)
  const rankingRef = useRef<HTMLAnchorElement>(null)
  const loginRef = useRef<HTMLAnchorElement>(null)
  const cutsRef = useRef<HTMLAnchorElement>(null)
  const location = useLocation()
  const fetcher = useFetcher()

  useEffect(() => {
    if (!rankingRef.current) {
      return
    }

    if (location.pathname === "/ranking/") {
      rankingRef.current.blur()
    }
  }, [location.pathname])

  useEffect(() => {
    if (!logoRef.current) {
      return
    }

    if (location.pathname === "/") {
      logoRef.current.blur()
    }
  })

  useEffect(() => {
    if (!cutsRef.current) {
      return
    }

    if (location.pathname === "/cuts/") {
      cutsRef.current.blur()
    }
  })

  useEffect(() => {
    if (!loginRef.current) {
      return
    }

    if ([
      "/login/",
      "/join/"
    ].includes(location.pathname)) {
      loginRef.current.blur()
    }
  })

  return (
    <>
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
      <Outlet />
    </>
  )
}
