import { NextResponse } from "next/server"
import { getUser } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Get user data
    const user = getUser(walletAddress)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      total_points: user.points,
      tasks_completed: user.completedTasks,
    })
  } catch (error) {
    console.error("Error fetching user points:", error)
    return NextResponse.json({ error: "Failed to fetch user points" }, { status: 500 })
  }
}
