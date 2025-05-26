"use client"

import { useState, useEffect } from "react"
import { Copy, CheckCircle, Loader2, WalletIcon, AlertCircle, Award, ExternalLink } from "lucide-react"
import * as web3 from "@solana/web3.js"
import { useToast, ToastProvider } from "@/components/SimpleToast"
import WalletConnectionForm from "@/components/WalletConnectionForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as apiService from "@/lib/api-service"

function WalletPageContent() {
  const toast = useToast()
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState({ sol: 0 })
  const [taskCompletions, setTaskCompletions] = useState([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [connection, setConnection] = useState(null)
  const [referralCode, setReferralCode] = useState(null)
  const [userPoints, setUserPoints] = useState(0)
  const [completedTasks, setCompletedTasks] = useState([])
  const [referralCount, setReferralCount] = useState(0)

  // Initialize Solana connection
  useEffect(() => {
    try {
      const conn = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed")
      setConnection(conn)
    } catch (err) {
      console.error("Failed to initialize Solana connection:", err)
      setError("Failed to connect to Solana network. Please try again later.")
    }
  }, [])

  // Add this useEffect after the existing ones for mobile state restoration
  useEffect(() => {
    // Restore wallet connection state for mobile users
    const checkMobileWalletState = () => {
      const userAgent = navigator.userAgent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isPhantomApp = !!(
        userAgent.includes("Phantom") ||
        window.phantom?.solana?.isPhantom ||
        window.solana?.isPhantom
      )

      if (isMobile && isPhantomApp) {
        const wasConnected = localStorage.getItem("walletConnectedInPhantom")
        const storedAddress = localStorage.getItem("connectedWalletAddress")

        if (wasConnected === "true" && storedAddress && !walletConnected) {
          // Try to restore connection
          if (window.solana?.isPhantom) {
            window.solana
              .connect({ onlyIfTrusted: true })
              .then((response) => {
                if (response.publicKey && response.publicKey.toString() === storedAddress) {
                  handleWalletConnected(storedAddress)
                }
              })
              .catch((err) => {
                console.log("Could not restore wallet connection:", err)
                // Clean up stale data
                localStorage.removeItem("walletConnectedInPhantom")
                localStorage.removeItem("connectedWalletAddress")
              })
          }
        }
      }
    }

    // Small delay to ensure Phantom is loaded
    setTimeout(checkMobileWalletState, 1000)
  }, [walletConnected])

  // Handle wallet connection
  const handleWalletConnected = async (address, refCode) => {
    try {
      setLoading(true)
      setError("")
      setWalletAddress(address)
      setWalletConnected(true)

      // Enhanced mobile detection
      const userAgent = navigator.userAgent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isPhantomApp = !!(
        userAgent.includes("Phantom") ||
        window.phantom?.solana?.isPhantom ||
        window.solana?.isPhantom
      )

      // Show appropriate success message based on environment
      if (isMobile && isPhantomApp) {
        toast.success("Wallet connected in Phantom app! You're ready to earn EcoCoin.")
      } else {
        toast.success("Wallet connected successfully!")
      }

      // Fetch wallet balance directly from Solana
      await fetchWalletBalance(address)

      // Load task completion history from API
      await loadTaskCompletions()

      // Use the provided refCode or the one from URL
      const referralToUse = refCode || referralCode

      // Log the referral information for debugging
      console.log("Connecting wallet with referral info:", {
        address,
        referralToUse,
        originalReferralCode: referralCode,
        isMobile,
        isPhantomApp,
      })

      // Register wallet with backend
      try {
        const result = await apiService.connectWallet(address, referralToUse)
        console.log("Wallet registered successfully:", result)

        // If the API returns user data, update the state
        if (result.user) {
          if (result.user.points) setUserPoints(result.user.points)
          if (result.user.completedTasks) setCompletedTasks(result.user.completedTasks)
          if (result.user.referrals) setReferralCount(result.user.referrals)
        }
      } catch (apiErr) {
        console.error("API error registering wallet:", apiErr)
        toast.warning("Connected to wallet, but had trouble registering with the server. Some features may be limited.")
        // Continue even if registration fails - we'll try again when fetching points
      }

      // Store connection info for mobile users
      if (isMobile && isPhantomApp) {
        localStorage.setItem("walletConnectedInPhantom", "true")
        localStorage.setItem("connectedWalletAddress", address)
      }
    } catch (err) {
      console.error("Error handling wallet connection:", err)
      setError(err.message || "Failed to process wallet connection. Please try again.")
      toast.error(err.message || "Failed to process wallet connection. Please try again.")
      setWalletConnected(false)
      setWalletAddress("")
    } finally {
      setLoading(false)
    }
  }

  // Load task completions from API
  const loadTaskCompletions = async () => {
    try {
      setLoading(true)

      // Fetch user points data which includes completed tasks
      const pointsData = await apiService.getUserPoints(walletAddress)

      // If the API returns task completion history, use it
      if (pointsData.tasks_completed && Array.isArray(pointsData.tasks_completed)) {
        // Convert the task IDs to a format that matches your UI expectations
        const taskHistory = pointsData.tasks_completed.map((taskId, index) => {
          // You can enhance this by fetching task details from getTasks() API
          return {
            id: taskId,
            name: `Task ${index + 1}`, // You might want to fetch actual task names
            points: 100, // Default points, you might want to fetch actual points from tasks API
            completedAt: new Date(Date.now() - index * 86400000).toISOString(), // Mock timestamps for now
          }
        })

        setTaskCompletions(taskHistory)
      } else {
        setTaskCompletions([])
      }

      // Set total points from API
      setTotalPoints(pointsData.total_points || 0)
    } catch (err) {
      console.error("Error loading task completions:", err)
      toast.error("Failed to load task history. Please try again.")
      setTaskCompletions([])
      setTotalPoints(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch wallet balance directly from Solana
  const fetchWalletBalance = async (address) => {
    if (!connection) {
      setError("Solana connection not established. Please refresh the page.")
      return
    }

    try {
      // Get SOL balance
      const publicKey = new web3.PublicKey(address)
      const solBalance = await connection.getBalance(publicKey)
      const solBalanceInSol = solBalance / web3.LAMPORTS_PER_SOL

      setBalance({
        sol: solBalanceInSol,
      })
    } catch (err) {
      console.error("Error fetching wallet balance:", err)
      setError("Failed to fetch wallet balance. Please try again.")
      toast.error("Failed to fetch wallet balance. Please try again.")
    }
  }

  // Refresh wallet balance
  const refreshBalance = async () => {
    if (!walletConnected || !walletAddress) {
      return
    }

    try {
      setLoading(true)
      await fetchWalletBalance(walletAddress)
      toast.success("Balance updated successfully!")
    } catch (err) {
      console.error("Error refreshing balance:", err)
      toast.error("Failed to refresh balance. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    try {
      // Only access window object in browser environment
      if (typeof window !== "undefined") {
        const { solana } = window
        if (solana && solana.isPhantom) {
          solana.disconnect()
        }
      }
    } catch (err) {
      console.error("Error disconnecting wallet:", err)
    }

    setWalletConnected(false)
    setWalletAddress("")
    setBalance({ sol: 0 })
    setTaskCompletions([])
    setTotalPoints(0)
    setError("")
  }

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "absolute"
      textArea.style.left = "-9999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      return new Promise((res, rej) => {
        document.execCommand("copy") ? res() : rej()
        textArea.remove()
      })
    }
  }

  const copyAddress = async () => {
    try {
      await copyToClipboard(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Wallet address copied to clipboard!")
    } catch (err) {
      console.error("Error copying address:", err)
      toast.error("Failed to copy address. Please try again.")
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Calculate time ago
  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    let interval = Math.floor(seconds / 31536000)
    if (interval >= 1) {
      return interval === 1 ? "1 year ago" : `${interval} years ago`
    }

    interval = Math.floor(seconds / 2592000)
    if (interval >= 1) {
      return interval === 1 ? "1 month ago" : `${interval} months ago`
    }

    interval = Math.floor(seconds / 86400)
    if (interval >= 1) {
      return interval === 1 ? "1 day ago" : `${interval} days ago`
    }

    interval = Math.floor(seconds / 3600)
    if (interval >= 1) {
      return interval === 1 ? "1 hour ago" : `${interval} hours ago`
    }

    interval = Math.floor(seconds / 60)
    if (interval >= 1) {
      return interval === 1 ? "1 minute ago" : `${interval} minutes ago`
    }

    return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100">
              Wallet Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              View your wallet balance, points, and activity history
            </p>
          </div>

          {!walletConnected ? (
            <div className="space-y-8">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-100">Connect Your Wallet</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Connect your Phantom wallet to view your balance and activity history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 mb-6">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Information</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      To view your wallet balance, points, and activity history, you need to connect your Phantom
                      wallet. Your SOL balance will be fetched directly from the Solana blockchain.
                    </AlertDescription>
                  </Alert>

                  <WalletConnectionForm onWalletConnected={handleWalletConnected} />
                </CardContent>
              </Card>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Why Connect Your Wallet?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">View Balance</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Check your Solana balance directly from the blockchain.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">Track Points</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      See your EcoCoin points from completed tasks and activities.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">Activity History</h3>
                    <p className="text-gray-600 dark:text-gray-400">View your task completions and airdrop claims.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">Secure Access</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your private keys never leave your device, ensuring maximum security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Wallet Info Card */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-100">Wallet Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Your connected wallet details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 mb-4">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <WalletIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Wallet Address</div>
                          <div className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                            {walletAddress}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAddress}
                        className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copy
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">SOL Balance</div>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : balance.sol.toFixed(6)} SOL
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshBalance}
                            disabled={loading}
                            className="text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                          Balance fetched directly from Solana blockchain
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">EcoCoin Points</div>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {totalPoints} points
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-green-600 dark:text-green-300">
                          Points earned from completed tasks and activities
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectWallet}
                        className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity History Card */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-100">Activity History</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Your task completions and point transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
                    </div>
                  ) : taskCompletions.length > 0 ? (
                    <div className="space-y-4">
                      {taskCompletions.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 border rounded-lg flex items-center justify-between border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${task.points > 0
                                ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                                : "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                                }`}
                            >
                              {task.points > 0 ? <Award className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{task.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {task.tokens
                                  ? `Spent ${Math.abs(task.points)} points to claim ${task.tokens} ECO tokens`
                                  : `Earned ${task.points} points`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-medium ${task.points > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-purple-600 dark:text-purple-400"
                                }`}
                            >
                              {task.points > 0 ? "+" : ""}
                              {task.points} points
                              {task.tokens ? ` / +${task.tokens} ECO` : ""}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(task.completedAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700">
                      <AlertTitle className="text-gray-800 dark:text-gray-200">No activity yet</AlertTitle>
                      <AlertDescription className="text-gray-600 dark:text-gray-400">
                        Complete tasks in the Airdrop section to earn points and see your activity history.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <ToastProvider>
      <WalletPageContent />
    </ToastProvider>
  )
}
