"use client"

import { useState, useEffect } from "react"
import { Wallet, AlertCircle, CheckCircle, Loader2, Copy } from "lucide-react"
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

const WalletConnectionForm = ({ onWalletConnected, referralCode }) => {
  const toast = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [phantomInstalled, setPhantomInstalled] = useState(false)
  const [referralInput, setReferralInput] = useState(referralCode || "")
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Detect mobile device
    const checkMobile = () => {
      if (typeof navigator !== "undefined") {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      }
      return false
    }

    setIsMobile(checkMobile())

    // Check if Phantom wallet is installed
    const checkPhantom = () => {
      if (typeof window === "undefined") return

      const mobile = checkMobile()

      if (mobile) {
        // On mobile, check if we can detect Phantom through different methods
        const hasPhantom = !!(
          window.solana?.isPhantom ||
          window.phantom?.solana?.isPhantom ||
          // Check if we're in the Phantom in-app browser
          (typeof navigator !== "undefined" && navigator.userAgent.includes("Phantom"))
        )
        setPhantomInstalled(hasPhantom)
      } else {
        // Desktop browser extension check
        setPhantomInstalled(!!window.solana?.isPhantom)
      }
    }

    checkPhantom()

    // Also check when the page becomes visible (helps with mobile app switching)
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        setTimeout(checkPhantom, 500)
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }

    // Only check for existing connection if user is on desktop or has explicitly interacted
    const checkExistingConnection = async () => {
      // Prevent auto-connection on mobile to avoid popup
      const mobile = checkMobile()

      if (mobile) {
        console.log("Mobile device detected - skipping auto-connection check")
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
          }
        }
      } catch (err) {
        // User hasn't connected before or rejected connection - this is normal
        console.log("No existing trusted connection found")
      } finally {
        setHasCheckedConnection(true)
      }
    }

    if (!hasCheckedConnection) {
      // Add a small delay to ensure page is fully loaded
      setTimeout(checkExistingConnection, 1000)
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [onWalletConnected, referralInput, hasCheckedConnection])

  const connectWallet = async () => {
    // Check for browser environment
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      setError("Browser environment not available")
      return
    }

    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Check for Phantom on mobile vs desktop
    let phantomAvailable = false

    if (mobile) {
      // On mobile, check multiple ways Phantom might be available
      phantomAvailable = !!(
        window.solana?.isPhantom ||
        window.phantom?.solana?.isPhantom ||
        navigator.userAgent.includes("Phantom")
      )

      // If not available, try to open Phantom app or redirect to app store
      if (!phantomAvailable) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const isAndroid = /Android/.test(navigator.userAgent)

        if (isIOS) {
          // Try to open Phantom app, fallback to App Store
          window.location.href =
            "https://phantom.app/ul/browse/" + encodeURIComponent(window.location.href) + "?ref=phantom"
          setTimeout(() => {
            window.open("https://apps.apple.com/app/phantom-solana-wallet/id1598432977", "_blank")
          }, 2000)
        } else if (isAndroid) {
          // Try to open Phantom app, fallback to Play Store
          window.location.href =
            "https://phantom.app/ul/browse/" + encodeURIComponent(window.location.href) + "?ref=phantom"
          setTimeout(() => {
            window.open("https://play.google.com/store/apps/details?id=app.phantom", "_blank")
          }, 2000)
        } else {
          setError("Please install the Phantom wallet app from your device's app store.")
        }
        return
      }
    } else {
      // Desktop browser extension check
      phantomAvailable = !!window.solana?.isPhantom

      if (!phantomAvailable) {
        setError("Phantom wallet extension is not installed. Please install it from https://phantom.app/")
        return
      }
    }

    try {
      setIsConnecting(true)
      setError("")

      // Get the Phantom provider
      const provider = window.solana || window.phantom?.solana

      if (!provider) {
        throw new Error("Phantom wallet not found")
      }

      // This will show the connection popup when user explicitly clicks
      const response = await provider.connect()
      const address = response.publicKey.toString()

      setWalletAddress(address)
      toast.success("Wallet connected successfully!")

      if (onWalletConnected) {
        onWalletConnected(address, referralInput)
      }
    } catch (err) {
      console.error("Error connecting wallet:", err)
      if (err.code === 4001) {
        // User rejected the connection
        setError("Connection was cancelled. Please try again if you want to connect your wallet.")
      } else if (err.message?.includes("not found")) {
        setError(
          "Phantom wallet not detected. Please make sure you're using the Phantom app browser or have the extension installed.",
        )
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
      setHasCheckedConnection(false) // Reset connection check
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

  if (walletAddress) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Wallet Connected
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
          {!phantomInstalled && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-300">Phantom Wallet Required</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                {isMobile ? (
                  <>
                    You need to install the Phantom wallet app to continue. After installing, please open this page in
                    the Phantom app browser.
                    <div className="mt-2 space-y-2">
                      <a
                        href="https://apps.apple.com/app/phantom-solana-wallet/id1598432977"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-black text-white px-3 py-1 rounded text-sm mr-2"
                      >
                        Download for iOS
                      </a>
                      <a
                        href="https://play.google.com/store/apps/details?id=app.phantom"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Download for Android
                      </a>
                    </div>
                    <div className="mt-2 text-sm">
                      <strong>Important:</strong> After installing, open the Phantom app and use the built-in browser to
                      visit this page.
                    </div>
                  </>
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

          {referralCode && (
            <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Referral Detected</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                You were referred by: {referralCode.substring(0, 6)}...{referralCode.substring(referralCode.length - 4)}
              </AlertDescription>
            </Alert>
          )}

          {referralInput && !referralCode && (
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

          <Button
            onClick={connectWallet}
            disabled={!phantomInstalled || isConnecting}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Phantom Wallet
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">Connection Error</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
            </Alert>
          )}

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
