import { NextResponse } from "next/server"
import { claimAirdrop, getUser } from "@/lib/db"

const REQUIRED_POINTS = 1000
const AIRDROP_AMOUNT = 1000 // 1000 ECO tokens
const REQUIRED_FEE_SOL = 0.006 // 0.006 SOL fee

export async function POST(request) {
  try {
    const body = await request.json()
    const { wallet_address } = body

    if (!wallet_address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Get user data
    const user = getUser(wallet_address)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has enough points
    if (user.points < REQUIRED_POINTS) {
      return NextResponse.json(
        { error: `Not enough points. You need ${REQUIRED_POINTS} points to claim the airdrop.` },
        { status: 400 },
      )
    }

    // In a real implementation, you would:
    // 1. Verify the 0.006 SOL payment was received to your airdrop wallet
    // 2. Send ECO tokens from your token account to the user's wallet
    // 3. Record the transaction on the blockchain

    // For this demo, we'll simulate the airdrop claim
    const result = claimAirdrop(wallet_address, AIRDROP_AMOUNT)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      status: "Airdrop sent",
      tokens: AIRDROP_AMOUNT,
      message: result.message,
      transaction: result.transaction,
      wallet: {
        address: wallet_address,
        ecoBalance: result.user.ecoBalance,
        points: result.user.points,
      },
    })
  } catch (error) {
    console.error("Error claiming airdrop:", error)
    return NextResponse.json({ error: "Failed to claim airdrop" }, { status: 500 })
  }
}
