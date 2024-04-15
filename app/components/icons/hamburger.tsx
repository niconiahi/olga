export function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 7H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M1 1H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M1 13H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  )
}
