import "dotenv/config"
import { Hono } from "hono"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { env } from "./env"
import { authRoutes } from "./routes/auth"

const app = new Hono()

app.use("*", logger())

app.get("/api/bff/health", (c) => c.json({ ok: true }))
app.route("/api/bff/auth", authRoutes)

app.notFound((c) => c.json({ success: false, payload: { message: "Not found" } }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ success: false, payload: { message: "Internal server error" } }, 500)
})

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`BFF listening on http://localhost:${info.port}`)
})
