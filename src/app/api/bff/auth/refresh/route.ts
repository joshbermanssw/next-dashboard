import { NextResponse } from "next/server"
import { updateSession } from "@/lib/session"
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

    await updateSession()

    return NextResponse.json({ success: true, payload: null })
  } catch {
    return NextResponse.json(
      { success: false, payload: { message: "An error occurred" } },
      { status: 500 }
    )
  }
}
