import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev"
import { defineConfig } from "vite"
import { remixDevTools } from "remix-development-tools"
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
