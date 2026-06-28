import "server-only"
import { bffFetch } from "@/server/bff/http"
import { services } from "@/server/config/services"
import {
  extractAccountId,
  extractAccountType,
  type AccountType,
} from "@/lib/definitions"

type CustomerWireResponse = { success: boolean; data: unknown }

export type CustomerAccount = {
  accountId?: string
  accountType?: AccountType
}

// Returns the plan accountId + accountType (from data.accounts) for a customer.
export async function getCustomerAccount(
  bearer: string,
  customerId: string,
): Promise<CustomerAccount> {
  const res = await bffFetch<CustomerWireResponse>(
    `${services.accounts.baseUrl}/customers/${customerId}`,
    { bearer, method: "GET" },
  )
  return {
    accountId: extractAccountId(res.data),
    accountType: extractAccountType(res.data),
  }
}
