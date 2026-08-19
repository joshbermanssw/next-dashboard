import type { KycSectionData, KycSectionKey } from "@/lib/kyc"

/**
 * Props every section wizard takes.
 *
 * A section owns its own steps and draft state, and hands back one validated
 * payload; the parent owns submission, so pending/error live there and every
 * section reports progress the same way.
 */
export type KycSectionProps<K extends KycSectionKey> = {
  /** Previously submitted answers, when the customer reopens a done section. */
  initial?: KycSectionData[K]
  /** Where the ✕ leads. */
  closeHref: string
  onSubmit: (data: KycSectionData[K]) => void
  pending: boolean
  error: string | null
}
