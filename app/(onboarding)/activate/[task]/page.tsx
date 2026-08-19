import { notFound } from "next/navigation"
import { verifySession } from "@/server/auth/dal"
import {
  ActivationTask,
  type PlaceholderTaskId,
} from "@/components/onboarding/activation-task"

// `identity` is absent on purpose — it is served by the static
// /activate/identity route, which takes precedence over this dynamic segment.
const TASKS: PlaceholderTaskId[] = ["security", "preferences", "billing"]

function isTaskId(value: string): value is PlaceholderTaskId {
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
