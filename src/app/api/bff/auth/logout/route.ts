import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/session"
import { getSession } from "@/lib/dal"

export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, payload: { message: "Not authenticated" } },
        { status: 401 }
      )
    }

    // Optionally notify backend of logout
    try {
      await fetch(`${process.env.MS_AUTH_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.userId }),
      })
    } catch {
      // Backend logout is best-effort — don't fail the client logout
    }

    await deleteSession()

    return NextResponse.json({ success: true, payload: null })
  } catch {
    return NextResponse.json(
      { success: false, payload: { message: "An error occurred" } },
      { status: 500 }
    )
  }
}
