"use client"

import { useState, useEffect } from "react"
import { Wallet, AlertCircle, CheckCircle, Loader2, Copy } from "lucide-react"
import { useToast } from "@/components/SimpleToast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

const WalletConnectionForm = ({ onWalletConnected, referralCode }) => {
  const toast = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState("")
  const [phantomInstalled, setPhantomInstalled] = useState(false)
  const [referralInput, setReferralInput] = useState(referralCode || "")
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false)

  useEffect(() => {
    // Check if Phantom wallet is installed
    const checkPhantom = () => {
      if (typeof window !== "undefined") {
        setPhantomInstalled(!!window.solana?.isPhantom)
      }
    }

    checkPhantom()

    // Only check for existing connection if user is on desktop or has explicitly interacted
    const checkExistingConnection = async () => {
      // Prevent auto-connection on mobile to avoid popup
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      if (isMobile) {
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

    if (phantomInstalled && !hasCheckedConnection) {
      // Add a small delay to ensure page is fully loaded
      setTimeout(checkExistingConnection, 1000)
    }
  }, [onWalletConnected, referralInput, hasCheckedConnection, phantomInstalled])

  const connectWallet = async () => {
    if (!phantomInstalled) {
      setError("Phantom wallet is not installed. Please install it from https://phantom.app/")
      return
    }

    try {
      setIsConnecting(true)
      setError("")

      // This will show the connection popup when user explicitly clicks
      const response = await window.solana.connect()
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
      if (window.solana?.isPhantom) {
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

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast.success("Wallet address copied to clipboard!")
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
                You need to install the Phantom wallet extension to continue.{" "}
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Download here
                </a>
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
