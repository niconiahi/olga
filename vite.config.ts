import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev"
import { remixDevTools } from "remix-development-tools"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import { ui } from "./plugins/ui/main"

export default defineConfig({
  plugins: [
    remixDevTools(),
    remixCloudflareDevProxy(),
    remix(),
    tsconfigPaths(),
    ui(),
  ],
  optimizeDeps: {
    exclude: ["oslo"],
  },
})
