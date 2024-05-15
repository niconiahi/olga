import { useEffect, useRef } from "react"

export default function() {
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (inputRef.current === undefined)
      return

    inputRef.current.focus()
  })

  return (
    <section className="px-auto mx-auto flex h-full w-80 flex-1 flex-col items-end justify-center space-y-2">
      <a
        href="/login/google"
        className="mabry flex w-full flex-row items-center justify-center border-2 border-solid border-google-blue bg-google-blue py-2 text-2xl text-brand-stone outline-4 -outline-offset-1 focus-visible:outline focus-visible:outline-brand-red"
      >
        <GoogleIcon className="mr-2 h-6 w-6" color="bluj" />
        Ingresar con Google
      </a>
    </section>
  )
}

// @component
export function GoogleIcon({ className, color }: { className: string, color: string }) {
  console.log('color', color)
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      />
    </svg>
  )
}

// @component
export const FirefoxIcon = ({ className, intent }: { className: string, intent: string }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      />
    </svg>
  )
}
