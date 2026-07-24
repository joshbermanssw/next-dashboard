import type { Metadata } from "next"
import { SignupWizard } from "@/components/auth/signup/signup-wizard"

export const metadata: Metadata = {
  title: "DosshPay — Create your account",
}

export default function SignupPage() {
  return <SignupWizard />
}
