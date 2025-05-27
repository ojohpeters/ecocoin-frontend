"use client"

import { useState, useEffect } from "react"
import {
  Check,
  Copy,
  AlertCircle,
  Loader2,
  Clock,
  Twitter,
  MessageCircle,
  Youtube,
  Instagram,
  Users,
  RefreshCw,
  CreditCard,
  ExternalLink,
} from "lucide-react"
import * as web3 from "@solana/web3.js"
import { useToast, ToastProvider } from "@/components/SimpleToast"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import * as apiService from "@/lib/api-service"
import WalletConnectionForm from "@/components/WalletConnectionForm"

// API configuration
const REQUIRED_POINTS = 1000
const TOKENS_PER_CLAIM = 1000
const AIRDROP_WALLET = "DkrCNNn27B1Loz6eGpMYKAL7b5J4GY6wwQs8wqY9ERBT"
const FEE_AMOUNT = 0.006 * web3.LAMPORTS_PER_SOL // 0.006 SOL in lamports
const TASK_COMPLETION_DELAY = 10000 // 10 seconds in milliseconds
const SUPPORT_EMAIL = "Support@ecotp.org"

// Social media links
const YOUTUBE_LINK = "https://www.youtube.com/@NightStories2025"
const INSTAGRAM_LINK = "https://www.instagram.com/ecocoin.eco?igsh=MWhsOW1uc3BhYzFjMQ=="
const TELEGRAM_LINK = "https://t.me/ecocoinglobal"
const TWITTER_LINK = "https://x.com/Ecocoin_Eco"

// Improved mobile detection that works across all browsers
const detectMobileEnvironment = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { isMobile: false, isPhantomApp: false, isPhantomInstalled: false }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform?.toLowerCase() || ""

  // More comprehensive mobile detection
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent) ||
    /android|iphone|ipad|ipod|blackberry|iemobile/i.test(platform) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
    window.innerWidth <= 768

  const isIOS = /ipad|iphone|ipod/.test(userAgent) || (platform.includes("mac") && navigator.maxTouchPoints > 1)
  const isAndroid = /android/.test(userAgent)

  // Check if we're in Phantom's in-app browser
  const isPhantomApp = !!(
    userAgent.includes("phantom") ||
    window.phantom?.solana?.isPhantom ||
    window.solana?.isPhantom
  )

  // Check if Phantom is available
  const isPhantomInstalled = !!(
    window.solana?.isPhantom ||
    window.phantom?.solana?.isPhantom ||
    (isMobile && (isIOS || isAndroid))
  )

  return {
    isMobile,
    isIOS,
    isAndroid,
    isPhantomApp,
    isPhantomInstalled,
    userAgent,
  }
}

// Function to get social media icon component
function getSocialIcon(iconName, className = "w-4 h-4 sm:w-5 sm:h-5") {
  const iconMap = {
    Twitter: <Twitter className={className} />,
    Telegram: <MessageCircle className={className} />,
    Youtube: <Youtube className={className} />,
    Instagram: <Instagram className={className} />,
    Users: <Users className={className} />,
  }
  return iconMap[iconName] || null
}

// Safe clipboard copy function
async function copyToClipboard(text) {
  try {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      throw new Error("Not in browser environment")
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)

    if (successful) {
      return true
    } else {
      throw new Error("Copy command failed")
    }
  } catch (err) {
    console.error("Failed to copy text to clipboard:", err)
    throw new Error("Failed to copy to clipboard")
  }
}

// Generate Solana Pay URL for fee payment
const generateSolanaPayURL = (walletAddress) => {
  const amount = 0.006 // 0.006 SOL
  const recipient = AIRDROP_WALLET
  const memo = `EcoCoin Airdrop Fee - ${walletAddress.substring(0, 8)}`

  const params = new URLSearchParams({
    recipient,
    amount: amount.toString(),
    memo,
    reference: walletAddress, // Use wallet address as reference for tracking
  })

  return `solana:${recipient}?${params.toString()}`
}

// Check if fee has been paid by looking for transactions
const checkFeePayment = async (connection, walletAddress) => {
  try {
    const publicKey = new web3.PublicKey(walletAddress)
    const airdropPublicKey = new web3.PublicKey(AIRDROP_WALLET)

    // Get recent transactions
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 50 })

    for (const signatureInfo of signatures) {
      try {
        const transaction = await connection.getTransaction(signatureInfo.signature, {
          maxSupportedTransactionVersion: 0,
        })

        if (transaction && transaction.meta && !transaction.meta.err) {
          // Check if this transaction sent SOL to the airdrop wallet
          const postBalances = transaction.meta.postBalances
          const preBalances = transaction.meta.preBalances
          const accountKeys =
            transaction.transaction.message.staticAccountKeys || transaction.transaction.message.accountKeys

          // Find airdrop wallet index
          const airdropIndex = accountKeys.findIndex((key) =>
            key.equals ? key.equals(airdropPublicKey) : key.toString() === AIRDROP_WALLET,
          )

          if (airdropIndex !== -1) {
            const balanceChange = postBalances[airdropIndex] - preBalances[airdropIndex]

            // Check if the amount is approximately 0.006 SOL (allowing for small variations)
            if (balanceChange >= FEE_AMOUNT * 0.95 && balanceChange <= FEE_AMOUNT * 1.05) {
              return {
                paid: true,
                transactionSignature: signatureInfo.signature,
                amount: balanceChange / web3.LAMPORTS_PER_SOL,
                timestamp: signatureInfo.blockTime,
              }
            }
          }
        }
      } catch (txError) {
        console.error("Error checking transaction:", txError)
        continue
      }
    }

    return { paid: false }
  } catch (error) {
    console.error("Error checking fee payment:", error)
    return { paid: false, error: error.message }
  }
}

function AirdropContent() {
  const toast = useToast()
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [connection, setConnection] = useState(null)
  const [tasks, setTasks] = useState([])
  const [userPoints, setUserPoints] = useState(0)
  const [completedTasks, setCompletedTasks] = useState([])
  const [visitedTasks, setVisitedTasks] = useState({})
  const [visitTimestamps, setVisitTimestamps] = useState({})
  const [loading, setLoading] = useState({
    tasks: false,
    taskCompletion: null,
    points: false,
    claim: false,
  })
  const [error, setError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimResult, setClaimResult] = useState(null)
  const [referralLink, setReferralLink] = useState("")
  const [referralCount, setReferralCount] = useState(0)
  const [referralCopied, setReferralCopied] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [taskTimers, setTaskTimers] = useState({})
  const [userReferralCode, setUserReferralCode] = useState("")
  const [possibleClaims, setPossibleClaims] = useState(0)
  const [environment, setEnvironment] = useState({
    isMobile: false,
    isPhantomApp: false,
    isPhantomInstalled: false,
  })

  // Initialize connection and detect environment
  useEffect(() => {
    // Initialize Solana connection
    try {
      const conn = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed")
      setConnection(conn)
    } catch (err) {
      console.error("Failed to initialize Solana connection:", err)
    }

    // Detect environment
    const env = detectMobileEnvironment()
    setEnvironment(env)
    console.log("Environment detected:", env)

    // Load tasks
    fetchTasks()

    // Check for referral in URL
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const ref = urlParams.get("ref")
        if (ref) {
          console.log("Referral detected:", ref)
          setReferralCode(ref)
        }
      } catch (err) {
        console.error("Error processing referral:", err)
      }
    }
  }, [])

  // Fetch user points when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      fetchUserPoints()

      // Generate referral link
      if (typeof window !== "undefined") {
        try {
          const baseUrl = window.location.origin + window.location.pathname
          setReferralLink(`${baseUrl}?ref=${walletAddress}`)
        } catch (err) {
          console.error("Error generating referral link:", err)
        }
      }
    }
  }, [walletConnected, walletAddress])

  // Update task timers
  useEffect(() => {
    const updateTaskTimers = () => {
      const now = Date.now()
      const newTimers = {}

      Object.entries(visitTimestamps).forEach(([taskId, timestamp]) => {
        if (!completedTasks.includes(taskId)) {
          const elapsedTime = now - timestamp
          const remainingTime = Math.max(0, TASK_COMPLETION_DELAY - elapsedTime)
          newTimers[taskId] = remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0
        }
      })

      // Check localStorage for persistence
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("task_") && key.endsWith("_timestamp")) {
          const taskId = key.replace("task_", "").replace("_timestamp", "")
          const timestamp = Number.parseInt(localStorage.getItem(key))
          const visited = localStorage.getItem(`task_${taskId}_visited`) === "true"

          if (visited && !completedTasks.includes(taskId) && timestamp) {
            const elapsedTime = now - timestamp
            const remainingTime = Math.max(0, TASK_COMPLETION_DELAY - elapsedTime)
            newTimers[taskId] = remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0

            if (!visitTimestamps[taskId]) {
              setVisitTimestamps((prev) => ({ ...prev, [taskId]: timestamp }))
              setVisitedTasks((prev) => ({ ...prev, [taskId]: true }))
            }
          }
        }
      })

      setTaskTimers(newTimers)
    }

    updateTaskTimers()
    const intervalId = setInterval(updateTaskTimers, 1000)
    return () => clearInterval(intervalId)
  }, [visitTimestamps, completedTasks])

  // Handle wallet connection
  const handleWalletConnected = async (address, refCode) => {
    try {
      setWalletAddress(address)
      setWalletConnected(true)
      setError("")

      const referralToUse = refCode || referralCode

      console.log("Connecting wallet:", { address, referralToUse })

      // Register wallet with backend
      try {
        const result = await apiService.connectWallet(address, referralToUse)
        console.log("Wallet registered successfully:", result)

        if (result.user) {
          if (result.user.points) setUserPoints(result.user.points)
          if (result.user.completedTasks) setCompletedTasks(result.user.completedTasks)
          if (result.user.referrals) setReferralCount(result.user.referrals)
        }

        toast.success("Wallet connected successfully!")
      } catch (apiErr) {
        console.error("API error registering wallet:", apiErr)
        toast.warning("Connected to wallet, but had trouble registering with the server.")
      }

      fetchUserPoints()
      fetchUserReferralCode()
    } catch (err) {
      console.error("Error handling wallet connection:", err)
      setError(err.message || "Failed to process wallet connection.")
      toast.error(err.message || "Failed to process wallet connection.")
      setWalletConnected(false)
      setWalletAddress("")
    }
  }

  // Fetch available tasks
  const fetchTasks = async () => {
    try {
      setLoading((prev) => ({ ...prev, tasks: true }))
      const tasksData = await apiService.getTasks()

      const processedTasks = tasksData.map((task) => {
        let link = task.link || ""
        let icon = task.icon || ""

        if (task.name.toLowerCase().includes("twitter") && !link) {
          link = TWITTER_LINK
          icon = icon || "Twitter"
        } else if (task.name.toLowerCase().includes("telegram") && !link) {
          link = TELEGRAM_LINK
          icon = icon || "Telegram"
        } else if (task.name.toLowerCase().includes("youtube") && !link) {
          link = YOUTUBE_LINK
          icon = icon || "Youtube"
        } else if (task.name.toLowerCase().includes("instagram") && !link) {
          link = INSTAGRAM_LINK
          icon = icon || "Instagram"
        } else if (
          (task.name.toLowerCase().includes("invite") ||
            task.name.toLowerCase().includes("friend") ||
            task.name.toLowerCase().includes("referral")) &&
          !icon
        ) {
          icon = icon || "Users"
        }

        return { ...task, link, icon }
      })

      setTasks(processedTasks)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to load tasks. Please try again later.")
      toast.error("Failed to load tasks. Please try again later.")
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }))
    }
  }

  // Fetch user's referral code
  const fetchUserReferralCode = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/user/referral_code?wallet=${walletAddress}`,
      )
      if (response.ok) {
        const data = await response.json()
        setUserReferralCode(data.referral_code || "")
      }
    } catch (err) {
      console.error("Error fetching referral code:", err)
    }
  }

  // Fetch user points and completed tasks
  const fetchUserPoints = async () => {
    try {
      setLoading((prev) => ({ ...prev, points: true }))
      setError("")

      const pointsData = await apiService.getUserPoints(walletAddress)

      setUserPoints(pointsData.total_points || 0)
      setCompletedTasks(pointsData.tasks_completed || [])
      setReferralCount(pointsData.referrals || 0)

      const claims = Math.floor((pointsData.total_points || 0) / REQUIRED_POINTS)
      setPossibleClaims(claims)

      console.log("Updated user points:", {
        points: pointsData.total_points,
        completedTasks: pointsData.tasks_completed,
        referrals: pointsData.referrals,
      })
    } catch (err) {
      console.error("Error fetching user points:", err)
      toast.error(err.message || "Failed to load your points. Please try again.")
      setError("Failed to load your points. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, points: false }))
    }
  }

  // Open social media link - improved for better mobile handling
  const openSocialLink = (task) => {
    if (task.link && typeof window !== "undefined") {
      const visitTime = Date.now()

      setVisitedTasks((prev) => ({ ...prev, [task.id]: true }))
      setVisitTimestamps((prev) => ({ ...prev, [task.id]: visitTime }))

      localStorage.setItem(`task_${task.id}_visited`, "true")
      localStorage.setItem(`task_${task.id}_timestamp`, visitTime.toString())

      const env = detectMobileEnvironment()

      if (env.isMobile && env.isPhantomApp) {
        // In Phantom app - use special handling
        localStorage.setItem("taskReturnFlag", "true")
        localStorage.setItem("currentTaskId", task.id)
        localStorage.setItem("currentTaskName", task.name)
        localStorage.setItem("taskVisitTime", visitTime.toString())

        toast.info(`Opening ${task.name}. Timer will continue running. You can complete the task after 10 seconds.`, {
          duration: 6000,
        })

        setTimeout(() => {
          try {
            const newWindow = window.open(task.link, "_blank", "noopener=yes,noreferrer=yes")
            if (!newWindow || newWindow.closed) {
              window.location.href = task.link
            } else {
              newWindow.focus()
            }
          } catch (error) {
            window.location.href = task.link
          }
        }, 500)
      } else {
        // Regular browser or mobile browser
        toast.info(`You'll be able to complete the task after 10 seconds.`)
        window.open(task.link, "_blank", "noopener,noreferrer")
      }
    }
  }

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    try {
      await copyToClipboard(referralLink)
      setReferralCopied(true)
      toast.success("Referral link copied to clipboard!")
      setTimeout(() => setReferralCopied(false), 2000)
    } catch (err) {
      console.error("Error copying referral link:", err)
      toast.error("Failed to copy referral link. Please try again.")
    }
  }

  // Check if a task is ready to be completed
  const isTaskReadyToComplete = (taskId) => {
    if (completedTasks.includes(taskId)) return false

    const visitedInState = visitedTasks[taskId]
    const visitedInStorage = localStorage.getItem(`task_${taskId}_visited`) === "true"

    if (!visitedInState && !visitedInStorage) return false

    let visitTime = visitTimestamps[taskId]
    if (!visitTime) {
      const storedTime = localStorage.getItem(`task_${taskId}_timestamp`)
      visitTime = storedTime ? Number.parseInt(storedTime) : 0
    }

    if (!visitTime) return false

    const timeElapsed = Date.now() - visitTime
    return timeElapsed >= TASK_COMPLETION_DELAY
  }

  // Complete a task
  const completeTask = async (taskId) => {
    if (completedTasks.includes(taskId)) {
      toast.info("You've already completed this task.")
      return
    }

    const task = tasks.find((t) => t.id === taskId)
    const isReferralTask =
      task &&
      (task.name.toLowerCase().includes("refer") ||
        task.name.toLowerCase().includes("friend") ||
        task.name.toLowerCase().includes("invite"))

    if (isReferralTask) {
      if (referralCount < 5) {
        toast.error(`You need to refer 5 friends to complete this task. Current referrals: ${referralCount}`)
        return
      }
    } else {
      if (!isTaskReadyToComplete(taskId)) {
        const remainingTime = taskTimers[taskId] || 10
        toast.error(`Please wait ${remainingTime} seconds after visiting before completing this task.`)
        return
      }
    }

    try {
      setLoading((prev) => ({ ...prev, taskCompletion: taskId }))
      setError("")

      const result = await apiService.completeTask(walletAddress, taskId)
      console.log("Task completion result:", result)

      if (result.points) {
        toast.success(`Task completed! You earned points.`)
      } else {
        toast.success("Task completed successfully!")
      }

      await fetchUserPoints()
    } catch (err) {
      console.error("Error completing task:", err)

      if (err.message.includes("already completed")) {
        toast.error("You've already completed this task.")
      } else if (err.message.includes("not found")) {
        toast.error("Task not found. Please refresh and try again.")
      } else {
        toast.error(err.message || "Failed to complete task. Please try again.")
      }

      setError(err.message || "Failed to complete task. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, taskCompletion: null }))
    }
  }

  // Claim airdrop
  const claimAirdrop = async () => {
    if (userPoints < REQUIRED_POINTS) {
      toast.error(`You need at least ${REQUIRED_POINTS} points to claim your airdrop.`)
      return
    }

    try {
      setLoading((prev) => ({ ...prev, claim: true }))
      setError("")

      const result = await apiService.claimAirdrop(walletAddress)
      console.log("Airdrop claim result:", result)

      if (result.tokens) {
        setClaimSuccess(true)
        setClaimResult(result)
        toast.success(`Airdrop claimed successfully! You received ${result.tokens} ECO tokens.`)

        await fetchUserPoints()

        setTimeout(() => {
          setClaimSuccess(false)
          setClaimResult(null)
        }, 5000)
      } else {
        toast.error("Failed to claim airdrop. Please try again.")
      }
    } catch (err) {
      console.error("Error claiming airdrop:", err)
      toast.error(err.message || "Failed to claim airdrop. Please try again.")
      setError(err.message || "Failed to claim airdrop. Please try again.")
    } finally {
      setLoading((prev) => ({ ...prev, claim: false }))
    }
  }

  // Get button state for task completion
  const getTaskButtonState = (task) => {
    const isReferralTask =
      task.name.toLowerCase().includes("refer") ||
      task.name.toLowerCase().includes("friend") ||
      task.name.toLowerCase().includes("invite")

    if (completedTasks.includes(task.id)) {
      return {
        variant: "outline",
        text: "Completed",
        disabled: true,
        className: "text-green-700 dark:text-green-300 border-green-300 dark:border-green-600",
      }
    }

    if (loading.taskCompletion === task.id) {
      return {
        variant: "default",
        text: <Loader2 className="h-4 w-4 animate-spin" />,
        disabled: true,
        className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      }
    }

    if (isReferralTask) {
      if (referralCount >= 5) {
        return {
          variant: "default",
          text: "Complete",
          disabled: false,
          className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
        }
      } else {
        return {
          variant: "outline",
          text: `${referralCount}/5 friends`,
          disabled: true,
          className: "text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600",
        }
      }
    }

    if (visitedTasks[task.id] && !isTaskReadyToComplete(task.id)) {
      const remainingTime = taskTimers[task.id] || 10
      return {
        variant: "outline",
        text: `Wait ${remainingTime}s`,
        disabled: true,
        className: "text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600",
      }
    }

    if (visitedTasks[task.id] && isTaskReadyToComplete(task.id)) {
      return {
        variant: "default",
        text: "Complete",
        disabled: false,
        className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      }
    }

    return {
      variant: "default",
      text: "Complete",
      disabled: true,
      className: "bg-gray-400 text-white dark:bg-gray-600 cursor-not-allowed",
    }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300">
              EcoCoin Airdrop
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Complete tasks, earn points, and claim your EcoCoin tokens!
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Wallet Connection */}
            {!walletConnected ? (
              <WalletConnectionForm onWalletConnected={handleWalletConnected} referralCode={referralCode} />
            ) : (
              <>
                {/* User Progress Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                          Your Progress
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                          Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={fetchUserPoints}
                          variant="outline"
                          size="sm"
                          disabled={loading.points}
                          className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                        >
                          {loading.points ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">Refresh</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Points Available</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{userPoints} points</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Possible Claims</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {possibleClaims} × {TOKENS_PER_CLAIM} tokens
                        </span>
                      </div>
                    </div>

                    <Progress
                      value={Math.min((userPoints / REQUIRED_POINTS) * 100, 100)}
                      className="h-2 bg-gray-200 dark:bg-gray-700"
                      indicatorClassName="bg-gradient-to-r from-green-500 to-green-400"
                    />

                    {possibleClaims > 0 ? (
                      <Alert className="bg-green-50 dark:bg-green-900/30 border-green-500">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Ready to Claim!</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                          You can claim {possibleClaims} airdrop{possibleClaims > 1 ? "s" : ""} (
                          {possibleClaims * TOKENS_PER_CLAIM} tokens total).
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-500">
                        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertTitle className="text-blue-800 dark:text-blue-300">Keep Going!</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-400">
                          You need {REQUIRED_POINTS - (userPoints % REQUIRED_POINTS)} more points to claim your next
                          airdrop.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Error display with retry button */}
                    {error && error.includes("Failed to load your points") && (
                      <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-500">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertTitle className="text-red-800 dark:text-red-300 flex items-center justify-between">
                          Error Loading Points
                          <Button
                            onClick={fetchUserPoints}
                            variant="outline"
                            size="sm"
                            disabled={loading.points}
                            className="text-red-700 border-red-300"
                          >
                            {loading.points ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Retry
                          </Button>
                        </AlertTitle>
                        <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Tasks Card - Improved responsive design */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                          Available Tasks
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                          Complete these tasks to earn points
                        </CardDescription>
                      </div>
                      <Button
                        onClick={fetchTasks}
                        variant="outline"
                        size="sm"
                        disabled={loading.tasks}
                        className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      >
                        {loading.tasks ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Refresh</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading.tasks ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
                      </div>
                    ) : tasks.length > 0 ? (
                      <div className="space-y-4">
                        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertTitle className="text-blue-800 dark:text-blue-300">Task Completion Process</AlertTitle>
                          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
                            Click "Visit" to open the social media link, then wait 10 seconds before you can complete
                            the task.
                          </AlertDescription>
                        </Alert>

                        {tasks.map((task) => {
                          const buttonState = getTaskButtonState(task)

                          return (
                            <div
                              key={task.id}
                              className={`p-3 sm:p-4 border rounded-lg transition-all duration-300 hover:shadow-md ${completedTasks.includes(task.id)
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : visitedTasks[task.id] && isTaskReadyToComplete(task.id)
                                  ? "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50"
                                  : visitedTasks[task.id]
                                    ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/50"
                                    : "border-gray-200 dark:border-gray-700"
                                }`}
                            >
                              {/* Mobile-first responsive layout */}
                              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                {/* Task info section */}
                                <div className="flex items-start space-x-3 min-w-0 flex-1">
                                  {/* Icon */}
                                  <div className="flex-shrink-0 mt-1">
                                    {completedTasks.includes(task.id) ? (
                                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      </div>
                                    ) : visitedTasks[task.id] ? (
                                      <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {getSocialIcon(task.icon) || (
                                          <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                            {tasks.indexOf(task) + 1}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Task details */}
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base break-words">
                                      {task.name}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {task.points} points
                                      </p>
                                      {(task.name.toLowerCase().includes("refer") ||
                                        task.name.toLowerCase().includes("friend") ||
                                        task.name.toLowerCase().includes("invite")) && (
                                          <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Requires 5 referrals ({referralCount}/5)
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                                  {task.link &&
                                    !(
                                      task.name.toLowerCase().includes("refer") ||
                                      task.name.toLowerCase().includes("friend") ||
                                      task.name.toLowerCase().includes("invite")
                                    ) && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openSocialLink(task)}
                                        disabled={completedTasks.includes(task.id)}
                                        className={`text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 ${completedTasks.includes(task.id) ? "opacity-50 cursor-not-allowed" : ""
                                          }`}
                                      >
                                        {visitedTasks[task.id] ? "Revisit" : "Visit"}
                                      </Button>
                                    )}
                                  <Button
                                    variant={buttonState.variant}
                                    size="sm"
                                    disabled={buttonState.disabled}
                                    onClick={() => completeTask(task.id)}
                                    className={`text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 ${buttonState.className}`}
                                  >
                                    {buttonState.text}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-sm sm:text-base">Failed to load tasks. Please try refreshing the page.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                          onClick={fetchTasks}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Referral Card - Improved responsive design */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-800 dark:text-gray-100">Refer Friends</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      Share your referral link and earn points when friends join
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Referral Link
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-grow font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 break-all"
                        />
                        <Button
                          onClick={copyReferralLink}
                          variant="outline"
                          size="sm"
                          className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                        >
                          {referralCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          <span className="ml-1 hidden sm:inline">Copy</span>
                        </Button>
                      </div>
                    </div>

                    {userReferralCode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Referral Code
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            type="text"
                            value={userReferralCode}
                            readOnly
                            className="flex-grow font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          />
                          <Button
                            onClick={() =>
                              copyToClipboard(userReferralCode).then(() => toast.success("Referral code copied!"))
                            }
                            variant="outline"
                            size="sm"
                            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">Copy</span>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Friends can use this code instead of your wallet address
                        </p>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      You have referred {referralCount} friends
                    </div>
                  </CardContent>
                </Card>

                {/* Claim Airdrop Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                      Claim Your Airdrop
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      Claim your EcoCoin tokens after completing tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {claimSuccess ? (
                      <Alert className="bg-green-50 dark:bg-green-900/30 border-green-500">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Success!</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                          {claimResult?.message || "Your EcoCoin tokens have been sent to your wallet."}
                        </AlertDescription>
                        {claimResult?.tokens && (
                          <div className="mt-2 p-3 bg-green-100 dark:bg-green-800/50 rounded-lg">
                            <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                              You received {claimResult.tokens} ECO tokens!
                            </p>
                          </div>
                        )}
                      </Alert>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium mb-2 flex items-center text-blue-800 dark:text-blue-300 text-sm sm:text-base">
                            <AlertCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            Information
                          </h4>
                          <div className="space-y-2 text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                            <p>
                              Each claim costs {REQUIRED_POINTS} points and gives you {TOKENS_PER_CLAIM} ECO tokens.
                            </p>
                            <p>
                              Current balance: {userPoints} points = {possibleClaims} possible claim
                              {possibleClaims !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={claimAirdrop}
                          disabled={possibleClaims === 0 || loading.claim}
                          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 text-sm sm:text-base"
                        >
                          {loading.claim ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : possibleClaims > 0 ? (
                            `Claim ${TOKENS_PER_CLAIM} Tokens (${REQUIRED_POINTS} points)`
                          ) : (
                            "Not Enough Points"
                          )}
                        </Button>

                        {error && !error.includes("Failed to load your points") && (
                          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-500">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-red-400 text-sm">
                              {error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default function Airdrop() {
  return (
    <ToastProvider>
      <AirdropContent />
    </ToastProvider>
  )
}
