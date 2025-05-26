import { NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/db"

export async function POST(request) {
  try {
    const body = await request.json()
    const { wallet_address } = body

    if (!wallet_address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Get or create user
    const user = getOrCreateUser(wallet_address)

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        ecoBalance: user.ecoBalance,
        points: user.points,
      },
    })
  } catch (error) {
    console.error("Error connecting wallet:", error)
    return NextResponse.json({ error: "Failed to connect wallet" }, { status: 500 })
  }
}
