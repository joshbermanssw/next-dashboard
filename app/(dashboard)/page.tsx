import { Suspense } from "react"
import { verifySession } from "@/server/auth/dal"
import { getOverview } from "@/server/bff/aggregators/overview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OverviewPage() {
  const { customer } = await verifySession()

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold">
        Welcome back, {customer.firstName}
      </h1>

      <Suspense fallback={<AccountsSkeleton />}>
        <Accounts />
      </Suspense>
    </div>
  )
}

async function Accounts() {
  const { accounts, errors } = await getOverview()

  if (errors.length > 0 && accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Unable to load accounts right now.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((acct) => (
        <Card key={acct.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{acct.nickname}</span>
              <span className="text-xs uppercase text-muted-foreground">
                {acct.type}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(acct.balance, acct.currency)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AccountsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(amount)
}
