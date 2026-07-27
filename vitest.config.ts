import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "server/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` throws the moment it is imported outside a React Server
      // Component. The modules it guards (lib/data/splitpay.ts) are plain logic
      // worth testing, so point it at the package's own no-op entry — the one
      // React itself resolves in a server environment.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
})
