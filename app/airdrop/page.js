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
const YOUTUBE_LINK = "https://www.youtube.com/@ecocoin2025"
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

// Fixed utility function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    // Check if we're in a browser environment
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
  const [showReturnButton, setShowReturnButton] = useState(false)

  // Initialize connection and fetch tasks on component mount
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
    if (typeof window !== "undefined") {
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

  // Fetch user points when wallet is connected and generate referral link
  useEffect(() => {
    if (walletConnected && walletAddress) {
      fetchUserPoints()

      // Generate referral link - only in browser
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

      // Check each visited task
      Object.entries(visitTimestamps).forEach(([taskId, timestamp]) => {
        if (!completedTasks.includes(taskId)) {
          const elapsedTime = now - timestamp
          const remainingTime = Math.max(0, TASK_COMPLETION_DELAY - elapsedTime)
          newTimers[taskId] = remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0
        }
      })

      // Also check localStorage for tasks visited in previous sessions
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("task_") && key.endsWith("_timestamp")) {
          const taskId = key.replace("task_", "").replace("_timestamp", "")
          const timestamp = Number.parseInt(localStorage.getItem(key))
          const visited = localStorage.getItem(`task_${taskId}_visited`) === "true"

          if (visited && !completedTasks.includes(taskId) && timestamp) {
            const elapsedTime = now - timestamp
            const remainingTime = Math.max(0, TASK_COMPLETION_DELAY - elapsedTime)
            newTimers[taskId] = remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0

            // Update state if not already set
            if (!visitTimestamps[taskId]) {
              setVisitTimestamps((prev) => ({ ...prev, [taskId]: timestamp }))
              setVisitedTasks((prev) => ({ ...prev, [taskId]: true }))
            }
          }
        }
      })

      setTaskTimers(newTimers)
    }

    // Update immediately
    updateTaskTimers()

    // Update every second
    const intervalId = setInterval(updateTaskTimers, 1000)

    return () => clearInterval(intervalId)
  }, [visitTimestamps, completedTasks])

  // Handle returning from external links (add this after other useEffects)
  useEffect(() => {
    // Check if user is returning from an external link
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const returnUrl = localStorage.getItem("phantomReturnUrl")
        const taskId = localStorage.getItem("phantomTaskId")
        const taskName = localStorage.getItem("phantomTaskName")

        if (returnUrl && taskId && window.location.href === returnUrl) {
          // User returned to the same page
          toast.success(`Welcome back! You can now complete the "${taskName}" task after the timer.`)

          // Clear the stored data
          localStorage.removeItem("phantomReturnUrl")
          localStorage.removeItem("phantomTaskId")
          localStorage.removeItem("phantomTaskName")
        }
      }
    }

    // Check on page load if user was redirected back
    const checkReturnFromTask = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const returned = urlParams.get("returned")
      const taskId = localStorage.getItem("phantomTaskId")

      if (returned === "true" && taskId) {
        const taskName = localStorage.getItem("phantomTaskName")
        toast.success(`Welcome back! You can now complete the "${taskName}" task after the timer.`)

        // Clear the stored data
        localStorage.removeItem("phantomReturnUrl")
        localStorage.removeItem("phantomTaskId")
        localStorage.removeItem("phantomTaskName")

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    checkReturnFromTask()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Add this useEffect to detect when user is about to leave
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const taskId = localStorage.getItem("phantomTaskId")
      if (taskId) {
        // Show return button or instructions
        setShowReturnButton(true)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

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
    if (task.link && typeof window !== "undefined") {
      // Mark the task as visited and record the timestamp
      const visitTime = Date.now()

      setVisitedTasks((prev) => ({
        ...prev,
        [task.id]: true,
      }))

      setVisitTimestamps((prev) => ({
        ...prev,
        [task.id]: visitTime,
      }))

      // Store in localStorage for persistence across page backgrounding
      localStorage.setItem(`task_${task.id}_visited`, "true")
      localStorage.setItem(`task_${task.id}_timestamp`, visitTime.toString())

      // Enhanced mobile and Phantom detection
      const userAgent = navigator.userAgent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isPhantomApp = !!(
        userAgent.includes("Phantom") ||
        window.phantom?.solana?.isPhantom ||
        window.solana?.isPhantom
      )

      if (isMobile && isPhantomApp) {
        // We're in Phantom mobile app - use special handling

        // Store task completion state with timestamp
        localStorage.setItem("taskReturnFlag", "true")
        localStorage.setItem("currentTaskId", task.id)
        localStorage.setItem("currentTaskName", task.name)
        localStorage.setItem("taskVisitTime", visitTime.toString())

        // Show user instructions with timer info
        toast.info(
          `Opening ${task.name}. You'll be able to complete the task after 10 seconds. The timer will continue even when you're on the external site.`,
          { duration: 8000 },
        )

        // Use a timeout to ensure the toast is shown before navigation
        setTimeout(() => {
          // Try to open in a way that doesn't close the current tab
          try {
            // Method 1: Try window.open with specific parameters
            const newWindow = window.open(
              task.link,
              "_blank",
              "noopener=yes,noreferrer=yes,resizable=yes,scrollbars=yes",
            )

            // If window.open fails or is blocked, fallback to location
            if (!newWindow || newWindow.closed) {
              throw new Error("Popup blocked")
            }

            // Focus the new window
            newWindow.focus()
          } catch (error) {
            console.log("Window.open failed, using location method")

            // Method 2: Use location.href but with return handling
            // Store current state more thoroughly
            localStorage.setItem("phantomReturnUrl", window.location.href)
            localStorage.setItem("phantomReturnTime", Date.now().toString())

            // Navigate to the external site
            window.location.href = task.link
          }
        }, 500)
      } else if (isMobile && !isPhantomApp) {
        // Regular mobile browser - open in new tab
        toast.info(`Opening ${task.name} in a new tab. You'll be able to complete the task after 10 seconds.`)
        window.open(task.link, "_blank", "noopener,noreferrer")
      } else {
        // Desktop - open in new tab
        toast.info(`You'll be able to complete the task after 10 seconds.`)
        window.open(task.link, "_blank", "noopener,noreferrer")
      }
    }
  }

  // Add this new function after openSocialLink:
  const handleReturnFromTask = () => {
    const taskId = localStorage.getItem("currentTaskId")
    const taskName = localStorage.getItem("currentTaskName")
    const visitTime = localStorage.getItem("taskVisitTime")

    if (taskId && taskName) {
      // Check if enough time has passed
      if (visitTime) {
        const elapsedTime = Date.now() - Number.parseInt(visitTime)
        const remainingTime = Math.max(0, TASK_COMPLETION_DELAY - elapsedTime)

        if (remainingTime === 0) {
          toast.success(`Welcome back! You can now complete "${taskName}" task.`)
        } else {
          const remainingSeconds = Math.ceil(remainingTime / 1000)
          toast.info(`Welcome back! You can complete "${taskName}" in ${remainingSeconds} seconds.`)
        }
      } else {
        toast.success(`Welcome back from ${taskName}!`)
      }

      // Clear the stored data
      localStorage.removeItem("taskReturnFlag")
      localStorage.removeItem("currentTaskId")
      localStorage.removeItem("currentTaskName")
      localStorage.removeItem("phantomReturnUrl")
      localStorage.removeItem("phantomReturnTime")
      localStorage.removeItem("taskVisitTime")
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

    // Check if the task has been visited (from state or localStorage)
    const visitedInState = visitedTasks[taskId]
    const visitedInStorage = localStorage.getItem(`task_${taskId}_visited`) === "true"

    if (!visitedInState && !visitedInStorage) {
      return false
    }

    // Get timestamp (from state or localStorage)
    let visitTime = visitTimestamps[taskId]
    if (!visitTime) {
      const storedTime = localStorage.getItem(`task_${taskId}_timestamp`)
      visitTime = storedTime ? Number.parseInt(storedTime) : 0
    }

    if (!visitTime) {
      return false
    }

    // Check if enough time has passed since visiting
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

  // Add this useEffect for better return handling
  useEffect(() => {
    // Enhanced return detection with timestamp restoration
    const handleReturnDetection = () => {
      // Check if user is returning from a task
      const taskReturnFlag = localStorage.getItem("taskReturnFlag")
      const returnTime = localStorage.getItem("phantomReturnTime")
      const currentTime = Date.now()

      if (taskReturnFlag === "true") {
        // Check if return is recent (within 5 minutes)
        if (!returnTime || currentTime - Number.parseInt(returnTime) < 300000) {
          handleReturnFromTask()
        } else {
          // Clear old data
          localStorage.removeItem("taskReturnFlag")
          localStorage.removeItem("currentTaskId")
          localStorage.removeItem("currentTaskName")
          localStorage.removeItem("phantomReturnUrl")
          localStorage.removeItem("phantomReturnTime")
          localStorage.removeItem("taskVisitTime")
        }
      }

      // Restore task states from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("task_") && key.endsWith("_visited")) {
          const taskId = key.replace("task_", "").replace("_visited", "")
          const timestamp = localStorage.getItem(`task_${taskId}_timestamp`)

          if (timestamp) {
            const visitTime = Number.parseInt(timestamp)
            setVisitedTasks((prev) => ({ ...prev, [taskId]: true }))
            setVisitTimestamps((prev) => ({ ...prev, [taskId]: visitTime }))
          }
        }
      })

      // Check URL parameters for return indication
      const urlParams = new URLSearchParams(window.location.search)
      const returned = urlParams.get("returned")
      if (returned === "true") {
        handleReturnFromTask()
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    // Check on component mount
    handleReturnDetection()

    // Enhanced visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Small delay to ensure app is fully focused
        setTimeout(() => {
          const taskReturnFlag = localStorage.getItem("taskReturnFlag")
          if (taskReturnFlag === "true") {
            handleReturnFromTask()
          }

          // Recalculate timers when page becomes visible
          const now = Date.now()
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("task_") && key.endsWith("_timestamp")) {
              const taskId = key.replace("task_", "").replace("_timestamp", "")
              const timestamp = Number.parseInt(localStorage.getItem(key))
              const visited = localStorage.getItem(`task_${taskId}_visited`) === "true"

              if (visited && !completedTasks.includes(taskId) && timestamp) {
                const elapsedTime = now - timestamp
                if (elapsedTime >= TASK_COMPLETION_DELAY) {
                  toast.success(`Task "${taskId}" is now ready to complete!`)
                }
              }
            }
          })
        }, 500)
      }
    }

    // Enhanced focus handler for better return detection
    const handleWindowFocus = () => {
      setTimeout(() => {
        const taskReturnFlag = localStorage.getItem("taskReturnFlag")
        if (taskReturnFlag === "true") {
          handleReturnFromTask()
        }
      }, 300)
    }

    // Add multiple event listeners for better detection
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleWindowFocus)

    // Also check periodically when page is visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        const taskReturnFlag = localStorage.getItem("taskReturnFlag")
        if (taskReturnFlag === "true") {
          handleReturnFromTask()
        }
      }
    }, 2000)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleWindowFocus)
      clearInterval(intervalId)
    }
  }, [completedTasks])

  // Clean up localStorage for completed tasks
  useEffect(() => {
    completedTasks.forEach((taskId) => {
      localStorage.removeItem(`task_${taskId}_visited`)
      localStorage.removeItem(`task_${taskId}_timestamp`)
    })
  }, [completedTasks])

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

          {/* URL Copy Section for Mobile Users Only */}
          {typeof window !== "undefined" &&
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
              <Card className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 shadow-lg mb-8">
                <CardHeader>
                  <CardTitle className="text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <Copy className="w-5 h-5" />🔒 Secure Access
                  </CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-400">
                    Copy this URL to access EcoCoin safely in your Phantom wallet browser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                      <label className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                        Current Page URL:
                      </label>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="text"
                          value={window.location.href}
                          readOnly
                          className="w-full font-mono text-xs bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                        />
                        <Button
                          onClick={async () => {
                            try {
                              await copyToClipboard(window.location.href)
                              toast.success("Page URL copied! You can paste this in Phantom's browser.")
                            } catch (err) {
                              toast.error("Failed to copy URL. Please copy it manually from the address bar.")
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy URL
                        </Button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        How to use this URL in Phantom:
                      </h4>
                      <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <span>Copy the URL above using the "Copy URL" button</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <span>Open your Phantom wallet app</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                            3
                          </span>
                          <span>Tap the browser/search icon (🔍 or 🌐) in the bottom navigation bar</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                            4
                          </span>
                          <span>Paste the URL in the search bar and press enter</span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-green-700 dark:text-green-400">
                            <p className="font-medium mb-1">🔒 Security Feature:</p>
                            <p>
                              Using Phantom's built-in browser ensures your wallet stays secure and prevents phishing
                              attacks. Always verify the URL matches our official domain before connecting your wallet.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      {showReturnButton && (
                        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 mb-4">
                          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertTitle className="text-blue-800 dark:text-blue-300">Returning from Task?</AlertTitle>
                          <AlertDescription className="text-blue-700 dark:text-blue-400">
                            <div className="space-y-2">
                              <p>
                                If you completed the social media task, click the button below to return and complete
                                the task.
                              </p>
                              <Button
                                onClick={() => {
                                  const currentUrl = window.location.href
                                  window.location.href = `${currentUrl}?returned=true`
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                I'm Back - Complete Task
                              </Button>
                              <Button
                                onClick={() => setShowReturnButton(false)}
                                variant="outline"
                                size="sm"
                                className="ml-2"
                              >
                                Dismiss
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      {tasks.map((task) => {
                        const buttonState = getTaskButtonState(task)

                        return (
                          <div
                            key={task.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg ${completedTasks.includes(task.id)
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : visitedTasks[task.id] && isTaskReadyToComplete(task.id)
                                ? "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/50"
                                : visitedTasks[task.id]
                                  ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/50"
                                  : "border-gray-200 dark:border-gray-700"
                              } transition-all duration-300 hover:shadow-md`}
                          >
                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                              {completedTasks.includes(task.id) ? (
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                              ) : visitedTasks[task.id] ? (
                                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  {getSocialIcon(task.icon) || (
                                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                      {tasks.indexOf(task) + 1}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-800 dark:text-gray-100 break-words">
                                  {task.name}
                                </h4>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span>{task.points} points</span>
                                  {(task.name.toLowerCase().includes("refer") ||
                                    task.name.toLowerCase().includes("friend") ||
                                    task.name.toLowerCase().includes("invite")) && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                        Requires 5 referrals ({referralCount}/5)
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
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
                                    className={`w-full sm:w-auto text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 ${completedTasks.includes(task.id) ? "opacity-50 cursor-not-allowed" : ""
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
                                className={`w-full sm:w-auto ${buttonState.className}`}
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
                          To claim your airdrop, you need to have earned at least {REQUIRED_POINTS} points by completing
                          tasks and pay a fee of 0.006 SOL to the airdrop wallet.
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
  )
}

export default function Airdrop() {
  return (
    <ToastProvider>
      <AirdropContent />
    </ToastProvider>
  )
}
