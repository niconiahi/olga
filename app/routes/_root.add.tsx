import { useFetcher } from "@remix-run/react"
import clsx from "clsx"
import { useEffect, useRef } from "react"



export default function() {
  const inputRef = useRef<HTMLInputElement>(null)
  const fetcher = useFetcher()

  useEffect(() => {
    if (!inputRef.current) {
      return
    }

    inputRef.current.focus()
  })

  return (
    <section className="flex h-full flex-1 flex-col items-center justify-center space-y-2">
      <fetcher.Form
        method="POST"
        action="/cut/add"
        className="w-80 space-y-2"
      >
        <p className="flex flex-col space-y-1">
          <label className="mabry leading-none text-brand-blue" htmlFor="day">
            Dia
          </label>
          <input
            required
            className="mabry border-2 border-brand-blue bg-brand-stone px-1 py-3 text-brand-blue outline-4 focus-visible:outline focus-visible:outline-brand-red md:hover:bg-brand-blueHover"
            type="number"
            ref={inputRef}
            id="day"
            name="day"
            // aria-invalid={addCuts.value?.error ? "true" : undefined}
            aria-errormessage="day-error"
          />
          <span
            id="day-error"
            className={clsx([
              "mabry text-brand-red underline decoration-brand-blue decoration-dotted decoration-2 underline-offset-1",
              // addCuts.value?.error ? "visible" : "invisible",
            ])}
          >
            {/*{addCuts.value?.error ?? "Olga"}*/}
          </span>
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
          className="mabry w-full border-2 border-brand-red bg-brand-red px-4 py-2 text-2xl text-brand-red outline-4 focus-visible:outline focus-visible:outline-brand-blue md:hover:bg-brand-stone md:hover:text-brand-red"
        >
          Agregar
        </button>
        {/*
        {addCuts.value
          && addCuts.value.success === true
          && addCuts.value.addedVideos
          && addCuts.value.addedVideos.length > 0
          ? (
            <ul>
              {addCuts.value.addedVideos.map(({ title }) => (
                <li key={`video_${title}`}>{title}</li>
              ))}
            </ul>
          )
          : null}
          */}
      </fetcher.Form>
    </section>
  )
}
