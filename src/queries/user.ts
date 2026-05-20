import { queryOptions } from "@tanstack/react-query"
import { fetchMe } from "@/api/auth"

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: fetchMe,
  staleTime: 5 * 60_000,
  retry: false,
})
