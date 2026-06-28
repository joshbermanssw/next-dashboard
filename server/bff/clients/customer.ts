import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import { extractAccountId } from "@/lib/definitions"

type CustomerWireResponse = { success: boolean; data: unknown }

// Returns the plan accountId (data.accounts.id) for a customer, or undefined.
export async function getCustomerAccountId(
  bearer: string,
  customerId: string,
): Promise<string | undefined> {
  const res = await bffFetch<CustomerWireResponse>(
    `${services.accounts.baseUrl}/customers/${customerId}`,
    { bearer, method: "GET" },
  )
  return extractAccountId(res.data)
}
