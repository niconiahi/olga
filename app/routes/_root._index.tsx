import { type MetaFunction, redirect } from "@remix-run/cloudflare"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ]
}

export function loader() {
  return redirect("/cuts")
}
