import { Outlet } from "@remix-run/react"

export default function () {
  return (
    <>
      <h1>layout</h1>
      <Outlet />
    </>
  )
}
