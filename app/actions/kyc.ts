"use server"

import { revalidatePath } from "next/cache"
import { verifySession } from "@/server/auth/dal"
import {
  sectionSchema,
  type KycSectionData,
  type KycSectionKey,
} from "@/lib/kyc"
import { clearKycApplication, writeKycSection } from "@/server/kyc/store"

export type SaveKycSectionResult = { ok: true } | { ok: false; message: string }

/**
 * Submits one KYC section.
 *
 * The client wizard validates as the customer moves between steps; this parses
 * again because a Server Action is a public endpoint — the UI's validation is
 * for feedback, this one is the gate.
 */
export async function saveKycSectionAction<K extends KycSectionKey>(
  section: K,
  data: KycSectionData[K],
): Promise<SaveKycSectionResult> {
  const session = await verifySession()

  const parsed = sectionSchema(section).safeParse(data)
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Check your answers and try again.",
    }
  }

  writeKycSection(session.customer.id, section, parsed.data)
  revalidatePath("/activate", "layout")

  return { ok: true }
}

/**
 * Dev affordance while the flow is mocked: wipes the application so it can be
 * walked again. Gated on the build so it can never run in production.
 */
export async function resetKycApplicationAction(): Promise<void> {
  if (process.env.NODE_ENV === "production") return

  const session = await verifySession()
  clearKycApplication(session.customer.id)
  revalidatePath("/activate", "layout")
}
