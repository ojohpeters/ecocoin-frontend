// API service for interacting with the backend

// Get the API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
console.log("API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL)


// Connect wallet
export async function connectWallet(walletAddress, referralCode) {
  try {
    console.log("Connecting wallet with referral:", { walletAddress, referralCode })

    const response = await fetch(`${API_BASE_URL}/user/connect_wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        referral_code: referralCode || undefined,
      }),
    })


    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to connect wallet")
    }

    const data = await response.json()
    console.log("Wallet connection response:", data)

    // Create a standardized response based on the API documentation
    return {
      status: data.status || "wallet connected",
      user: {
        walletAddress: walletAddress,
        points: data.points || 0,
        completedTasks: data.tasks_completed || [],
        referrals: data.referrals || 0,
      },
    }
  } catch (error) {
    console.error("Error connecting wallet:", error)
    throw error
  }
}

// Complete task
export async function completeTask(walletAddress, taskId) {
  try {
    console.log("Completing task:", { walletAddress, taskId })

    const response = await fetch(`${API_BASE_URL}/user/complete_task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        task_id: taskId,
      }),
    })

    const data = await response.json()
    console.log("Task completion response:", data)

    if (!response.ok) {
      throw new Error(data.error || "Failed to complete task")
    }

    // Get updated user points after task completion
    const pointsData = await getUserPoints(walletAddress)

    return {
      status: data.status || "task recorded",
      points: pointsData.total_points,
      completedTasks: pointsData.tasks_completed,
    }
  } catch (error) {
    console.error("Error completing task:", error)
    throw error
  }
}

// Get user points
export async function getUserPoints(walletAddress) {
  try {
    console.log("Fetching user points:", walletAddress)

    const response = await fetch(`${API_BASE_URL}/user/points?wallet=${walletAddress}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch user points")
    }

    const data = await response.json()
    console.log("User points data:", data)

    // Return data in the format specified by the API documentation
    return {
      wallet: data.wallet || walletAddress,
      total_points: data.total_points || 0,
      tasks_completed: data.tasks_completed || [],
      referrals: data.referrals || 0,
    }
  } catch (error) {
    console.error("Error fetching user points:", error)
    throw error
  }
}

// Claim airdrop
export async function claimAirdrop(walletAddress) {
  try {
    console.log(`Sending airdrop claim request to ${API_BASE_URL}/user/claim_airdrop for wallet: ${walletAddress}`)

    const response = await fetch(`${API_BASE_URL}/user/claim_airdrop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet_address: walletAddress }),
    })

    console.log("Airdrop claim response status:", response.status)

    const data = await response.json()
    console.log("Airdrop claim response data:", data)

    if (!response.ok) {
      throw new Error(data.error || "Failed to claim airdrop")
    }

    return {
      status: data.status || "Airdrop sent",
      tokens: data.tokens || 1000,
      message: data.message || "Airdrop sent successfully",
      transaction: data.transaction || null,
    }
  } catch (error) {
    console.error("Error claiming airdrop:", error)
    throw error
  }
}

// Get tasks
export async function getTasks() {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch tasks")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }
}

// Get user stats (total wallets)
export async function getUserStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/user/stats`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch user stats")
    }

    const data = await response.json()
    return {
      total_wallets: data.total_wallets || 0,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    throw error
  }
}
