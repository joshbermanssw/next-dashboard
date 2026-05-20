function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} environment variable is required`)
  return value
}

export const env = {
  get SESSION_SECRET() {
    return required("SESSION_SECRET")
  },
  get MS_AUTH_BASE_URL() {
    return required("MS_AUTH_BASE_URL")
  },
  MS_API_BASE_URL: process.env.MS_API_BASE_URL ?? "",
  PORT: Number(process.env.PORT ?? 8787),
  NODE_ENV: process.env.NODE_ENV ?? "development",
}
