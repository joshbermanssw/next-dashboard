import { verifySession } from "@/server/auth/dal"

export default async function ExpenseManagerPage() {
  await verifySession()
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold">Expense Manager</h1>
    </div>
  )
}
