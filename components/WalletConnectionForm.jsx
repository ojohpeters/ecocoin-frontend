"use client"

import { useState, useEffect } from "react"
import {
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  ExternalLink,
  Smartphone,
  Download,
  ArrowRight,
} from "lucide-react"
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
  const isPhantomInstalled = !!(window.solana?.isPhantom || window.phantom?.solana?.isPhantom)

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

// Test if Phantom app is actually installed on mobile
const testPhantomAppInstalled = async () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }

    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)

    if (!isIOS && !isAndroid) {
      resolve(false)
      return
    }

    // Create a hidden iframe to test the deep link
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = "phantom://browse"

    let resolved = false

    // If the app is installed, this should work without error
    iframe.onload = () => {
      if (!resolved) {
        resolved = true
        resolve(true)
      }
    }

    iframe.onerror = () => {
      if (!resolved) {
        resolved = true
        resolve(false)
      }
    }

    document.body.appendChild(iframe)

    // Timeout after 2 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(false)
      }
      document.body.removeChild(iframe)
    }, 2000)
  })
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
  const [showPhantomOptions, setShowPhantomOptions] = useState(false)
  const [isTestingApp, setIsTestingApp] = useState(false)
  const [phantomAppDetected, setPhantomAppDetected] = useState(null)
  const [showDeepLinkInstructions, setShowDeepLinkInstructions] = useState(false)

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    const env = detectEnvironment()
    setEnvironment(env)

    console.log("Environment detected:", env)

    // If mobile and not in Phantom app, show options instead of auto-redirect
    if (env.isMobile && !env.isPhantomApp) {
      setShowPhantomOptions(true)

      // Test if Phantom app is actually installed
      setIsTestingApp(true)
      testPhantomAppInstalled().then((isInstalled) => {
        setPhantomAppDetected(isInstalled)
        setIsTestingApp(false)
      })
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
      toast.success("Welcome back! Connecting your wallet...")
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

    // If mobile and not in Phantom app, show instructions instead of connecting
    if (env.isMobile && !env.isPhantomApp) {
      setShowDeepLinkInstructions(true)
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

  const openInPhantomApp = () => {
    const currentUrl = window.location.href
    const phantomUrl = generatePhantomDeepLink(currentUrl)

    // Store connection intention
    localStorage.setItem("phantomAutoConnect", "true")
    localStorage.setItem("phantomReturnUrl", currentUrl)

    // Show user what's happening
    toast.info("Opening Phantom app... If it doesn't open automatically, please open Phantom manually.", {
      duration: 5000,
    })

    // Try to open Phantom app
    window.location.href = phantomUrl

    // Set a timeout to show fallback options if deep link fails
    setTimeout(() => {
      setShowDeepLinkInstructions(true)
    }, 3000)
  }

  const copyCurrentUrl = async () => {
    try {
      await copyToClipboard(window.location.href)
      toast.success("Page URL copied! You can paste this in Phantom's browser.")
    } catch (err) {
      toast.error("Failed to copy URL. Please copy it manually from the address bar.")
    }
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
          {/* Mobile Phantom Options */}
          {environment.isMobile && !environment.isPhantomApp && showPhantomOptions && (
            <Alert className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
              <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <AlertTitle className="text-purple-800 dark:text-purple-300">Mobile Device Detected</AlertTitle>
              <AlertDescription className="text-purple-700 dark:text-purple-400">
                <div className="space-y-4">
                  <p className="font-medium">For security and best experience, use the Phantom app browser:</p>

                  {/* URL Copy Field */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                    <label className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      🔒 Secure URL - Copy this link:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="text"
                        value={typeof window !== "undefined" ? window.location.href : ""}
                        readOnly
                        className="flex-1 font-mono text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                      />
                      <Button
                        onClick={copyCurrentUrl}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      This ensures you're connecting to the authentic EcoCoin website
                    </p>
                  </div>

                  {isTestingApp ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking if Phantom app is installed...
                    </div>
                  ) : phantomAppDetected === true ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4" />
                        Phantom app detected on your device!
                      </div>

                      {/* Step by step instructions */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Follow these steps:</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-xs flex-shrink-0 mt-0.5">
                              1
                            </span>
                            <div>
                              <p className="font-medium">Copy the URL above</p>
                              <p className="text-green-600 dark:text-green-400 text-xs">
                                This ensures you're on the real EcoCoin site
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-xs flex-shrink-0 mt-0.5">
                              2
                            </span>
                            <div>
                              <p className="font-medium">Open Phantom app</p>
                              <p className="text-green-600 dark:text-green-400 text-xs">
                                Look for the Phantom icon on your phone
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-xs flex-shrink-0 mt-0.5">
                              3
                            </span>
                            <div>
                              <p className="font-medium">Tap the search/browser icon</p>
                              <p className="text-green-600 dark:text-green-400 text-xs">
                                It's usually at the bottom of the app (🔍 or 🌐)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-xs flex-shrink-0 mt-0.5">
                              4
                            </span>
                            <div>
                              <p className="font-medium">Paste the URL in the search bar</p>
                              <p className="text-green-600 dark:text-green-400 text-xs">
                                This opens EcoCoin safely within Phantom
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={openInPhantomApp}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Try Auto-Open
                        </Button>
                        <Button
                          onClick={copyCurrentUrl}
                          variant="outline"
                          className="flex-1 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ) : phantomAppDetected === false ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                        <AlertCircle className="w-4 h-4" />
                        Phantom app not detected. Please install it first.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {environment.isIOS && (
                          <a
                            href="https://apps.apple.com/app/phantom-solana-wallet/id1598432977"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download for iOS
                          </a>
                        )}
                        {environment.isAndroid && (
                          <a
                            href="https://play.google.com/store/apps/details?id=app.phantom"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download for Android
                          </a>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Security Notice */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-400">
                        <p className="font-medium mb-1">🔒 Security Feature:</p>
                        <p>
                          Using Phantom's browser ensures your wallet stays secure and prevents phishing attacks. Always
                          verify the URL matches our official domain.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Deep Link Instructions */}
          {showDeepLinkInstructions && environment.isMobile && !environment.isPhantomApp && (
            <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Manual Instructions</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                <div className="space-y-4">
                  <p>If the app didn't open automatically, please follow these steps:</p>

                  {/* URL Copy Field for manual instructions */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Copy this URL:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="text"
                        value={typeof window !== "undefined" ? window.location.href : ""}
                        readOnly
                        className="flex-1 font-mono text-xs bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                      />
                      <Button
                        onClick={copyCurrentUrl}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <span>Open the Phantom app on your device</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <span>Tap the browser/search icon (🔍 or 🌐) at the bottom navbar</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Paste the copied URL in the search bar and press enter</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={openInPhantomApp}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                    >
                      Try Auto-Open Again
                    </Button>
                    <Button
                      onClick={() => setShowDeepLinkInstructions(false)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      I'll Do It Manually
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Desktop Phantom Not Installed */}
          {!environment.isMobile && !environment.isPhantomInstalled && (
            <Alert className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-300">Phantom Wallet Required</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                <div className="space-y-3">
                  <p>You need to install the Phantom wallet extension to continue.</p>
                  <a
                    href="https://phantom.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Phantom Extension
                  </a>
                </div>
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
            disabled={
              (!environment.isPhantomInstalled && !environment.isMobile) ||
              isConnecting ||
              (environment.isMobile && !environment.isPhantomApp && !showDeepLinkInstructions)
            }
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : environment.isMobile && !environment.isPhantomApp ? (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Use Phantom App First
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
