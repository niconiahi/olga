import { hydrateRoot } from "react-dom/client"
import { StrictMode } from "react"
import { RemixBrowser } from "@remix-run/react"
import { createRoot } from './main'



hydrateRoot(
  document.querySelector('#root'),
  document.querySelector('#root')
)
