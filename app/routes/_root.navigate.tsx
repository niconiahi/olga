import { Link } from "@remix-run/react";

export default function() {
  return (
    <nav>
      <ul className="space-y-2">
        <li className="flex">
          <Link
            className="mabry w-full border-2 border-solid border-brand-blue px-4 py-2.5 text-center text-lg text-brand-blue outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red"
            to="/cuts"
          >
            Cortes
          </Link>
        </li>
        <li className="flex">
          <Link
            className="mabry w-full border-2 border-solid border-brand-blue px-4 py-2.5 text-center text-lg text-brand-blue outline-4 outline-offset-0 focus-visible:outline focus-visible:outline-brand-red"
            to="/ranking"
          >
            Ranking
          </Link>
        </li>
      </ul>
    </nav>
  )
}
