"use client"

import { useActionState } from "react"
import { login } from "@/actions/auth"
import type { LoginFormState } from "@/lib/definitions"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(
    login,
    undefined
  )

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">DosshPay</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>
      <div className="rounded-lg bg-card p-6 shadow-xl">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-card-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-card-foreground"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:bg-accentBlueHover disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
