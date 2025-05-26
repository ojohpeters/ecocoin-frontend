"use client"

import { useState, useEffect } from "react"
import { Wallet, AlertCircle, CheckCircle, Loader2, Copy, ExternalLink, Smartphone } from "lucide-react"
import { useToast } from "@/components/SimpleToast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

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

// Enhanced mobile and Phantom detection
const detectEnvironment = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { isMobile: false, isPhantomApp: false, isPhantomInstalled: false }
  }

  const userAgent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  const isAndroid = /Android/.test(userAgent)

  // Check if we're in Phantom's in-app browser
  const isPhantomApp = !!(
    userAgent.includes("Phantom") ||
    window.phantom?.solana?.isPhantom ||
    window.solana?.isPhantom
  )

  // Check if Phantom is installed (desktop extension or mobile app)
  const isPhantomInstalled = !!(
    (window.solana?.isPhantom || window.phantom?.solana?.isPhantom || (isMobile && (isIOS || isAndroid))) // Assume mobile users can install
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

// Generate Phantom deep link
const generatePhantomDeepLink = (currentUrl) => {
  const encodedUrl = encodeURIComponent(currentUrl)
  return `https://phantom.app/ul/browse/${encodedUrl}?ref=ecocoin`
}

const WalletConnectionForm = ({ onWalletConnected, referralCode }) => {
  const toast = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [referralInput, setReferralInput] = useState(referralCode || "")
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false)
  const [environment, setEnvironment] = useState({
    isMobile: false,
    isPhantomApp: false,
    isPhantomInstalled: false,
  })
  const [showMobileInstructions, setShowMobileInstructions] = useState(false)

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    const env = detectEnvironment()
    setEnvironment(env)

    console.log("Environment detected:", env)

    // If mobile and not in Phantom app, show instructions
    if (env.isMobile && !env.isPhantomApp) {
      setShowMobileInstructions(true)
    }

    // Auto-redirect to Phantom app if on mobile and not already in Phantom
    if (env.isMobile && !env.isPhantomApp && env.isPhantomInstalled) {
      const currentUrl = window.location.href
      const phantomUrl = generatePhantomDeepLink(currentUrl)

      // Store the intention to connect
      localStorage.setItem("phantomAutoConnect", "true")
      localStorage.setItem("phantomReturnUrl", currentUrl)

      // Show user what's happening
      toast.info("Redirecting to Phantom app for better experience...")

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = phantomUrl
      }, 2000)
    }

    // Check for existing connection only if in Phantom app or desktop
    const checkExistingConnection = async () => {
      if (env.isMobile && !env.isPhantomApp) {
        setHasCheckedConnection(true)
        return
      }

      try {
        if (window.solana?.isPhantom && !hasCheckedConnection) {
          // Use onlyIfTrusted to prevent popup
          const response = await window.solana.connect({ onlyIfTrusted: true })
          if (response.publicKey) {
            const address = response.publicKey.toString()
            setWalletAddress(address)
            if (onWalletConnected) {
              onWalletConnected(address, referralInput)
            }

            // Clear auto-connect flag if it was set
            localStorage.removeItem("phantomAutoConnect")
          }
        }
      } catch (err) {
        console.log("No existing trusted connection found")
      } finally {
        setHasCheckedConnection(true)
      }
    }

    // Check for auto-connect intention
    const autoConnect = localStorage.getItem("phantomAutoConnect")
    if (autoConnect === "true" && env.isPhantomApp) {
      localStorage.removeItem("phantomAutoConnect")
      // Auto-connect since user intended to connect
      setTimeout(() => {
        connectWallet()
      }, 1000)
    } else {
      checkExistingConnection()
    }

    // Handle visibility change (user returning from external links)
    const handleVisibilityChange = () => {
      if (!document.hidden && env.isPhantomApp) {
        // User returned to the app, check if they completed any tasks
        const taskReturn = localStorage.getItem("taskReturnFlag")
        if (taskReturn) {
          localStorage.removeItem("taskReturnFlag")
          toast.success("Welcome back! You can now complete your tasks.")
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [onWalletConnected, referralInput, hasCheckedConnection])

  const connectWallet = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      setError("Browser environment not available")
      return
    }

    const env = detectEnvironment()

    // If mobile and not in Phantom app, redirect to Phantom
    if (env.isMobile && !env.isPhantomApp) {
      const currentUrl = window.location.href
      const phantomUrl = generatePhantomDeepLink(currentUrl)

      // Store connection intention
      localStorage.setItem("phantomAutoConnect", "true")
      localStorage.setItem("phantomReturnUrl", currentUrl)

      toast.info("Redirecting to Phantom app...")

      // Try to open Phantom app
      window.location.href = phantomUrl

      // Fallback to app store if Phantom doesn't open
      setTimeout(() => {
        if (env.isIOS) {
          window.open("https://apps.apple.com/app/phantom-solana-wallet/id1598432977", "_blank")
        } else if (env.isAndroid) {
          window.open("https://play.google.com/store/apps/details?id=app.phantom", "_blank")
        }
      }, 3000)

      return
    }

    // Check for Phantom availability
    const provider = window.solana || window.phantom?.solana
    if (!provider?.isPhantom) {
      if (env.isMobile) {
        setError("Please open this page in the Phantom app browser.")
      } else {
        setError("Phantom wallet extension is not installed. Please install it from https://phantom.app/")
      }
      return
    }

    try {
      setIsConnecting(true)
      setError("")

      // Connect to Phantom
      const response = await provider.connect()
      const address = response.publicKey.toString()

      setWalletAddress(address)
      toast.success("Wallet connected successfully!")

      if (onWalletConnected) {
        onWalletConnected(address, referralInput)
      }

      // Clear any stored connection intentions
      localStorage.removeItem("phantomAutoConnect")
      localStorage.removeItem("phantomReturnUrl")
    } catch (err) {
      console.error("Error connecting wallet:", err)
      if (err.code === 4001) {
        setError("Connection was cancelled. Please try again if you want to connect your wallet.")
      } else if (err.message?.includes("not found")) {
        setError("Phantom wallet not detected. Please make sure you're using the Phantom app browser.")
      } else {
        setError(err.message || "Failed to connect wallet. Please try again.")
      }
      toast.error("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (typeof window !== "undefined" && window.solana?.isPhantom) {
        await window.solana.disconnect()
      }
      setWalletAddress("")
      setHasCheckedConnection(false)
      toast.success("Wallet disconnected successfully!")
    } catch (err) {
      console.error("Error disconnecting wallet:", err)
      toast.error("Failed to disconnect wallet.")
    }
  }

  const copyAddress = async () => {
    try {
      await copyToClipboard(walletAddress)
      toast.success("Wallet address copied to clipboard!")
    } catch (err) {
      console.error("Error copying address:", err)
      toast.error("Failed to copy address. Please try again.")
    }
  }

  const openInPhantom = () => {
    const currentUrl = window.location.href
    const phantomUrl = generatePhantomDeepLink(currentUrl)
    window.location.href = phantomUrl
  }

  // If wallet is connected, show connected state
  if (walletAddress) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Wallet Connected
            {environment.isPhantomApp && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                Phantom App
              </span>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Your Phantom wallet is successfully connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Connected Address</div>
                  <div className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{walletAddress}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {environment.isPhantomApp && (
              <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Phantom App Detected</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  You're using the Phantom app browser. External links will open in new tabs and you can return here
                  easily.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-100">Connect Your Wallet</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Connect your Phantom wallet to participate in the EcoCoin ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mobile Instructions */}
          {environment.isMobile && !environment.isPhantomApp && (
            <Alert className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
              <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <AlertTitle className="text-purple-800 dark:text-purple-300">Mobile Users</AlertTitle>
              <AlertDescription className="text-purple-700 dark:text-purple-400">
                <div className="space-y-3">
                  <p>For the best experience on mobile, please use the Phantom app browser:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
                        1
                      </span>
                      Install Phantom app if you haven't already
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
                        2
                      </span>
                      Open Phantom app and use the built-in browser
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
                        3
                      </span>
                      Navigate to this page in the Phantom browser
                    </div>
                  </div>
                  <Button onClick={openInPhantom} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Phantom App
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Phantom Not Installed */}
          {!environment.isPhantomInstalled && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-300">Phantom Wallet Required</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                {environment.isMobile ? (
                  <div className="space-y-3">
                    <p>You need to install the Phantom wallet app to continue.</p>
                    <div className="flex flex-col gap-2">
                      {environment.isIOS && (
                        <a
                          href="https://apps.apple.com/app/phantom-solana-wallet/id1598432977"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Download for iOS
                        </a>
                      )}
                      {environment.isAndroid && (
                        <a
                          href="https://play.google.com/store/apps/details?id=app.phantom"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Download for Android
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    You need to install the Phantom wallet extension to continue.{" "}
                    <a
                      href="https://phantom.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      Download here
                    </a>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Referral Code */}
          {referralCode && (
            <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Referral Detected</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                You were referred by: {referralCode.substring(0, 6)}...{referralCode.substring(referralCode.length - 4)}
              </AlertDescription>
            </Alert>
          )}

          {!referralCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Referral Code (Optional)
              </label>
              <Input
                type="text"
                placeholder="Enter referral wallet address"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a friend's wallet address to give them referral credit
              </p>
            </div>
          )}

          {/* Connect Button */}
          <Button
            onClick={connectWallet}
            disabled={(!environment.isPhantomInstalled && !environment.isMobile) || isConnecting}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : environment.isMobile && !environment.isPhantomApp ? (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Phantom App
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Phantom Wallet
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">Connection Error</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have a Phantom wallet?{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                Download here
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletConnectionForm
