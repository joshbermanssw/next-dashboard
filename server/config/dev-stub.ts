import "server-only"

/**
 * Dev-only escape hatch for the sign-up flow while the backend OTP dispatch is
 * down. When enabled, the server actions skip the real device/init/verify and
 * soft-provisioning calls, accept any well-formed 6-digit code, and forge a
 * local session so the whole flow can be walked end-to-end.
 *
 * Gated on `NODE_ENV !== "production"` as well as the env var, so it can never
 * take effect in a production build even if the variable leaks into that
 * environment. Remove the call sites (grep `signupStubEnabled`) once the
 * backend send is fixed.
 */
export function signupStubEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    ["1", "true"].includes(process.env.SIGNUP_DEV_STUB ?? "")
  )
}
