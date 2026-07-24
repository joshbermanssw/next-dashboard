import { notFound } from "next/navigation"
import { verifySession } from "@/server/auth/dal"
import { ActivationTask } from "@/components/onboarding/activation-task"
import type { ActivationTaskId } from "@/lib/activation"

const TASKS: ActivationTaskId[] = [
  "identity",
  "security",
  "preferences",
  "billing",
]

function isTaskId(value: string): value is ActivationTaskId {
  return (TASKS as string[]).includes(value)
}

export default async function ActivationTaskPage({
  params,
}: {
  params: Promise<{ task: string }>
}) {
  await verifySession()

  const { task } = await params
  if (!isTaskId(task)) notFound()

  return <ActivationTask task={task} />
}
