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
const AIRDROP_WALLET = "DkrCNNn27B1Loz6eGpMYKAL7b5J4GY6wwQs8wqY9ERBT"
const FEE_AMOUNT = 0.006 * web3.LAMPORTS_PER_SOL // 0.006 SOL in lamports
const TASK_COMPLETION_DELAY = 10000 // 10 seconds in milliseconds
const SUPPORT_EMAIL = "Support@ecotp.org"

// Social media links
const YOUTUBE_LINK = "https://www.youtube.com/@NightStories2025"
const INSTAGRAM_LINK = "https://www.instagram.com/ecocoin.eco?igsh=MWhsOW1uc3BhYzFjMQ=="
const TELEGRAM_LINK = "https://t.me/ecocoinglobal"
const TWITTER_LINK = "https://x.com/Ecocoin_Eco"

// Function to get social media icon component
function getSocialIcon(iconName, className = "w-5 h-5") {
  const iconMap = {
    Twitter: <Twitter className={className} />,
    Telegram: <MessageCircle className={className} />,
    Youtube: <Youtube className={className} />,
    Instagram: <Instagram className={className} />,
    Users: <Users className={className} />,
  }

  return iconMap[iconName] || null
}

// Utility function to copy text to clipboard
async function copyToClipboard(text) {
  try {
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

function AirdropContent() {
  const toast = useToast()
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [connection, setConnection] = useState(null)
  const [tasks, setTasks] = useState([])
  const [userPoints, setUserPoints] = useState(0)
  const [completedTasks, setCompletedTasks] = useState([])
  const [visitedTasks, setVisitedTasks] = useState({}) // Track which tasks have been visited
  const [visitTimestamps, setVisitTimestamps] = useState({}) // Track when tasks were visited
  const [loading, setLoading] = useState({
    tasks: false,
    taskCompletion: null, // Will store task ID when completing
    points: false,
    claim: false,
  })
  const [error, setError] = useState("")
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimResult, setClaimResult] = useState(null)
  const [referralLink, setReferralLink] = useState("")
  const [referralCount, setReferralCount] = useState(0)
  const [referralCopied, setReferralCopied] = useState(false)
  const [balance, setBalance] = useState({ eco: 0, sol: 0 })
  const [transactions, setTransactions] = useState([])
  const [referralCode, setReferralCode] = useState("")
  const [taskTimers, setTaskTimers] = useState({}) // Track countdown timers for tasks

  // Initialize connection and fetch tasks on component mount
  // Fix the useEffect that accesses window.location
  useEffect(() => {
    // Initialize Solana connection
    try {
      const conn = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed")
      setConnection(conn)
    } catch (err) {
      console.error("Failed to initialize Solana connection:", err)
    }

    // Load tasks
    fetchTasks()

    // Check for referral in URL - only in browser
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const ref = urlParams.get("ref")
        if (ref) {
          console.log("Referral detected:", ref)
          setReferralCode(ref)
          console.log("Full referral code:", ref)
        }
      } catch (err) {
        console.error("Error processing referral:", err)
      }
    }
  }, [])

  // Fix the useEffect that generates referral links
  useEffect(() => {
    if (walletConnected && walletAddress) {
      fetchUserPoints()

      // Generate referral link - only in browser
      if (typeof window !== 'undefined') {
        try {
          const baseUrl = window.location.origin + window.location.pathname
          setReferralLink(`${baseUrl}?ref=${walletAddress}`)
        } catch (err) {
          console.error("Error generating referral link:", err)
        }
      }
    }
  }, [walletConnected, walletAddress])

  // Fetch user points when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      fetchUserPoints()

      // Generate referral link
      try {
        const baseUrl = window.location.origin + window.location.pathname
        setReferralLink(`${baseUrl}?ref=${walletAddress}`)
      } catch (err) {
        console.error("Error generating referral link:", err)
      }
    }
  }, [walletConnected, walletAddress])

  // Update task timers
  useEffect(() => {
    const timerIds = {}

    // For each visited task that has a timestamp, start a countdown timer
    Object.entries(visitTimestamps).forEach(([taskId, timestamp]) => {
      if (!completedTasks.includes(taskId)) {
        const updateTimer = () => {
          const now = Date.now()
          const elapsedTime = now - timestamp
          const remainingTime = Math.max(0, TASK_COMPLETION_DELAY - elapsedTime)

          setTaskTimers((prev) => ({
            ...prev,
            [taskId]: remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0,
          }))

          if (remainingTime > 0) {
            timerIds[taskId] = setTimeout(updateTimer, 1000)
          }
        }

        updateTimer()
      }
    })

    // Cleanup timers on unmount
    return () => {
      Object.values(timerIds).forEach((id) => clearTimeout(id))
    }
  }, [visitTimestamps, completedTasks])

  // Handle wallet connection
  const handleWalletConnected = async (address, refCode) => {
    try {
      setWalletAddress(address)
      setWalletConnected(true)
      setError("")

      // Use the provided refCode or the one from URL
      const referralToUse = refCode || referralCode

      // Log the referral information for debugging
      console.log("Connecting wallet with referral info:", {
        address,
        referralToUse,
        originalReferralCode: referralCode,
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

        toast.success("Wallet connected successfully!")
      } catch (apiErr) {
        console.error("API error registering wallet:", apiErr)
        toast.warning("Connected to wallet, but had trouble registering with the server. Some features may be limited.")
        // Continue even if registration fails - we'll try again when fetching points
      }

      // Fetch user points regardless of wallet registration success
      fetchUserPoints()
    } catch (err) {
      console.error("Error handling wallet connection:", err)
      setError(err.message || "Failed to process wallet connection. Please try again.")
      toast.error(err.message || "Failed to process wallet connection. Please try again.")
      setWalletConnected(false)
      setWalletAddress("")
    }
  }

  // Fetch available tasks
  const fetchTasks = async () => {
    try {
      setLoading((prev) => ({ ...prev, tasks: true }))

      // Use our API service to fetch tasks
      const tasksData = await apiService.getTasks()

      // Process tasks to add links and icons if they're not provided by the API
      const processedTasks = tasksData.map((task) => {
        let link = task.link || ""
        let icon = task.icon || ""

        // Add links and icons based on task name if not provided by API
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

        return {
          ...task,
          link,
          icon,
        }
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

  // Fetch user points and completed tasks
  const fetchUserPoints = async () => {
    try {
      setLoading((prev) => ({ ...prev, points: true }))
      setError("")

      // Use our API service to fetch user points
      const pointsData = await apiService.getUserPoints(walletAddress)

      // Update state with the response data
      setUserPoints(pointsData.total_points || 0)
      setCompletedTasks(pointsData.tasks_completed || [])
      setReferralCount(pointsData.referrals || 0)

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

  // Open social media link and mark task as visited
  const openSocialLink = (task) => {
    if (task.link) {
      // Mark the task as visited and record the timestamp
      setVisitedTasks((prev) => ({
        ...prev,
        [task.id]: true,
      }))

      setVisitTimestamps((prev) => ({
        ...prev,
        [task.id]: Date.now(),
      }))

      // Open the link in a new tab
      window.open(task.link, "_blank")

      // Show a toast to inform the user
      toast.info(`Please wait 10 seconds after visiting before completing the task.`)
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
    // If the task is already completed, it's not ready
    if (completedTasks.includes(taskId)) {
      return false
    }

    // If the task hasn't been visited, it's not ready
    if (!visitedTasks[taskId]) {
      return false
    }

    // Check if enough time has passed since visiting
    const visitTime = visitTimestamps[taskId] || 0
    const timeElapsed = Date.now() - visitTime

    return timeElapsed >= TASK_COMPLETION_DELAY
  }

  // Complete a task
  const completeTask = async (taskId) => {
    if (completedTasks.includes(taskId)) {
      toast.info("You've already completed this task.")
      return
    }

    // Find the task to check if it's a referral task
    const task = tasks.find((t) => t.id === taskId)

    // Check if this is a referral task
    const isReferralTask =
      task &&
      (task.name.toLowerCase().includes("refer") ||
        task.name.toLowerCase().includes("friend") ||
        task.name.toLowerCase().includes("invite"))

    // For referral tasks, check if user has referred at least 5 users
    if (isReferralTask) {
      if (referralCount < 5) {
        toast.error(`You need to refer 5 friends to complete this task. Current referrals: ${referralCount}`)
        return
      }
    } else {
      // For non-referral tasks, check if the task is ready to be completed
      if (!isTaskReadyToComplete(taskId)) {
        const remainingTime = taskTimers[taskId] || 10
        toast.error(`Please wait ${remainingTime} seconds after visiting before completing this task.`)
        return
      }
    }

    try {
      setLoading((prev) => ({ ...prev, taskCompletion: taskId }))
      setError("")

      // Use our API service to complete the task
      const result = await apiService.completeTask(walletAddress, taskId)

      console.log("Task completion result:", result)

      // Show success message with points earned
      if (result.points) {
        toast.success(`Task completed! You earned points.`)
      } else {
        toast.success("Task completed successfully!")
      }

      // Refresh user points to get updated data
      await fetchUserPoints()
    } catch (err) {
      console.error("Error completing task:", err)

      // Handle specific error cases
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

      // Use our API service to claim the airdrop
      const result = await apiService.claimAirdrop(walletAddress, FEE_AMOUNT, AIRDROP_WALLET)

      console.log("Airdrop claim result:", result)

      // Show success message with tokens received
      if (result.tokens) {
        setClaimSuccess(true)
        setClaimResult(result)
        toast.success(`Airdrop claimed successfully! You received ${result.tokens} ECO tokens.`)
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
    // Check if this is a referral task
    const isReferralTask =
      task.name.toLowerCase().includes("refer") ||
      task.name.toLowerCase().includes("friend") ||
      task.name.toLowerCase().includes("invite")

    // If task is already completed
    if (completedTasks.includes(task.id)) {
      return {
        variant: "outline",
        text: "Completed",
        disabled: true,
        className: "text-green-700 dark:text-green-300 border-green-300 dark:border-green-600",
      }
    }

    // If task is being completed (loading)
    if (loading.taskCompletion === task.id) {
      return {
        variant: "default",
        text: <Loader2 className="h-4 w-4 animate-spin" />,
        disabled: true,
        className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      }
    }

    // Handle referral tasks specially
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

    // For non-referral tasks, continue with existing logic
    // If task has been visited but waiting for timer
    if (visitedTasks[task.id] && !isTaskReadyToComplete(task.id)) {
      const remainingTime = taskTimers[task.id] || 10
      return {
        variant: "outline",
        text: `Wait ${remainingTime}s`,
        disabled: true,
        className: "text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600",
      }
    }

    // If task has been visited and is ready to complete
    if (visitedTasks[task.id] && isTaskReadyToComplete(task.id)) {
      return {
        variant: "default",
        text: "Complete",
        disabled: false,
        className: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      }
    }

    // Default state - not visited yet
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
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300">
              EcoCoin Airdrop
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete tasks, earn points, and claim your EcoCoin tokens!
            </p>
          </div>

          <div className="space-y-8">
            {/* Wallet Connection */}
            {!walletConnected ? (
              <WalletConnectionForm onWalletConnected={handleWalletConnected} referralCode={referralCode} />
            ) : (
              <>
                {/* User Progress Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-gray-800 dark:text-gray-100">Your Progress</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Points Earned</span>
                        <span className="font-bold text-gray-800 dark:text-gray-100">
                          {userPoints} / {REQUIRED_POINTS}
                        </span>
                      </div>
                      <Progress
                        value={(userPoints / REQUIRED_POINTS) * 100}
                        className="h-2 bg-gray-200 dark:bg-gray-700"
                        indicatorClassName="bg-gradient-to-r from-green-500 to-green-400"
                      />

                      {loading.points ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-green-600 dark:text-green-400" />
                        </div>
                      ) : error && error.includes("Failed to load your points") ? (
                        <div className="mt-2 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchUserPoints}
                            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                          >
                            Retry Loading Points
                          </Button>
                        </div>
                      ) : null}

                      {userPoints >= REQUIRED_POINTS ? (
                        <Alert className="bg-green-50 dark:bg-green-900/30 border-green-500">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <AlertTitle className="text-green-800 dark:text-green-300">Congratulations!</AlertTitle>
                          <AlertDescription className="text-green-700 dark:text-green-400">
                            You've earned enough points to claim your airdrop.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500">
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertTitle className="text-yellow-800 dark:text-yellow-300">Keep Going!</AlertTitle>
                          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                            You need {REQUIRED_POINTS - userPoints} more points to claim your airdrop.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Available Tasks</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Complete these tasks to earn points
                    </CardDescription>
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
                          <AlertDescription className="text-blue-700 dark:text-blue-400">
                            You must first click "Visit" to open the social media link, then wait 10 seconds before you
                            can complete the task.
                          </AlertDescription>
                        </Alert>

                        {tasks.map((task) => {
                          const buttonState = getTaskButtonState(task)

                          return (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-4 border rounded-lg ${completedTasks.includes(task.id)
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : visitedTasks[task.id] && isTaskReadyToComplete(task.id)
                                  ? "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50"
                                  : visitedTasks[task.id]
                                    ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/50"
                                    : "border-gray-200 dark:border-gray-700"
                                } transition-all duration-300 hover:shadow-md`}
                            >
                              <div className="flex items-center">
                                {completedTasks.includes(task.id) ? (
                                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  </div>
                                ) : visitedTasks[task.id] ? (
                                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mr-4">
                                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                                    {getSocialIcon(task.icon) || (
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {tasks.indexOf(task) + 1}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-100">{task.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {task.points} points
                                    {(task.name.toLowerCase().includes("refer") ||
                                      task.name.toLowerCase().includes("friend") ||
                                      task.name.toLowerCase().includes("invite")) &&
                                      ` • Requires 5 referrals (${referralCount}/5)`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
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
                                      className={`text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 ${completedTasks.includes(task.id) ? "opacity-50 cursor-not-allowed" : ""
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
                                  className={buttonState.className}
                                >
                                  {buttonState.text}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                        <p>Failed to load tasks. Please try refreshing the page.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                          onClick={fetchTasks}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Referral Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Refer Friends</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Share your referral link and earn points when friends join
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-grow font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        />
                        <Button
                          onClick={copyReferralLink}
                          variant="outline"
                          size="icon"
                          className="ml-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {referralCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          You have referred {referralCount} friends
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Claim Airdrop Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100">Claim Your Airdrop</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
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
                            <p className="text-green-800 dark:text-green-300 font-medium">
                              You received {claimResult.tokens} ECO tokens!
                            </p>
                          </div>
                        )}
                      </Alert>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium mb-2 flex items-center text-blue-800 dark:text-blue-300">
                            <AlertCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            Information
                          </h4>
                          <p className="text-sm mb-2 text-blue-700 dark:text-blue-400">
                            To claim your airdrop, you need to have earned at least {REQUIRED_POINTS} points by
                            completing tasks and pay a fee of 0.006 SOL to the airdrop wallet.
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Ensure you have a token account for ECO tokens in your wallet. The fee will be sent to{" "}
                            {AIRDROP_WALLET.substring(0, 6)}...{AIRDROP_WALLET.substring(AIRDROP_WALLET.length - 4)}.
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Need help? Contact our support team at{" "}
                            <a
                              href={`mailto:${SUPPORT_EMAIL}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {SUPPORT_EMAIL}
                            </a>
                          </p>
                        </div>

                        <Button
                          onClick={claimAirdrop}
                          disabled={userPoints < REQUIRED_POINTS || loading.claim}
                          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                        >
                          {loading.claim ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Claim Airdrop"
                          )}
                        </Button>

                        {error && (
                          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-500">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
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
