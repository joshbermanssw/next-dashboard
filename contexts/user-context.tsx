"use client"

import { createContext, useContext } from "react"
import type { Customer } from "@/lib/definitions"

type UserContextValue = {
  customer: Customer
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  customer,
  children,
}: {
  customer: Customer
  children: React.ReactNode
}) {
  return (
    <UserContext.Provider value={{ customer }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
