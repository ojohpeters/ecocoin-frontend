// Simple in-memory database for development
let db = {
  users: {},
  transactions: [],
  airdrops: {},
}

// Initialize a user if they don't exist
export function getOrCreateUser(walletAddress) {
  if (!db.users[walletAddress]) {
    db.users[walletAddress] = {
      walletAddress,
      ecoBalance: 0,
      completedTasks: [],
      points: 0,
      claimedAirdrop: false,
      referrals: [],
    }
  }
  return db.users[walletAddress]
}

// Get user data
export function getUser(walletAddress) {
  return db.users[walletAddress] || null
}

// Update user data
export function updateUser(walletAddress, data) {
  if (!db.users[walletAddress]) {
    db.users[walletAddress] = { walletAddress }
  }

  db.users[walletAddress] = {
    ...db.users[walletAddress],
    ...data,
  }

  return db.users[walletAddress]
}

// Complete a task
export function completeTask(walletAddress, taskId, pointsValue) {
  const user = getOrCreateUser(walletAddress)

  // Check if task is already completed
  if (user.completedTasks.includes(taskId)) {
    return { success: false, message: "Task already completed" }
  }

  // Add task to completed tasks
  user.completedTasks.push(taskId)
  user.points += pointsValue

  return {
    success: true,
    user,
    message: `Task completed! You earned ${pointsValue} points.`,
  }
}

// Claim airdrop
export function claimAirdrop(walletAddress, amount) {
  const user = getOrCreateUser(walletAddress)

  // Check if airdrop already claimed
  if (user.claimedAirdrop) {
    return { success: false, message: "Airdrop already claimed" }
  }

  // Update user balance and mark airdrop as claimed
  user.ecoBalance += amount
  user.claimedAirdrop = true

  // Record transaction
  const transaction = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: "airdrop",
    walletAddress,
    amount,
    timestamp: new Date().toISOString(),
  }

  db.transactions.push(transaction)

  return {
    success: true,
    user,
    transaction,
    message: `Airdrop of ${amount} ECO claimed successfully!`,
  }
}

// Add referral
export function addReferral(walletAddress, referrerAddress) {
  const user = getOrCreateUser(walletAddress)
  const referrer = getOrCreateUser(referrerAddress)

  // Check if this user has already been referred
  if (user.referredBy) {
    return { success: false, message: "User already has a referrer" }
  }

  // Update user with referrer
  user.referredBy = referrerAddress

  // Update referrer's referrals
  if (!referrer.referrals.includes(walletAddress)) {
    referrer.referrals.push(walletAddress)
    referrer.points += 100 // Add points for referral
  }

  return {
    success: true,
    referrer,
    message: `Referral recorded. ${referrerAddress} received 100 points.`,
  }
}

// Get all transactions for a wallet
export function getTransactions(walletAddress) {
  return db.transactions.filter((tx) => tx.walletAddress === walletAddress)
}

// Reset database (for development)
export function resetDb() {
  db = {
    users: {},
    transactions: [],
    airdrops: {},
  }
  return { success: true, message: "Database reset" }
}
