"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf, Menu, X, ChevronDown } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [activeLink, setActiveLink] = useState("")
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    // Set active link based on current path
    const path = window.location.pathname
    setActiveLink(path)

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Check if wallet is already connected - but prevent auto-popup on mobile
    const checkWalletConnection = async () => {
      // Detect mobile devices
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      if (isMobile) {
        console.log("Mobile device detected - skipping auto-connection check in navbar")
        setHasCheckedConnection(true)
        return
      }

      try {
        const provider = window.solana || window.phantom?.solana
        if (provider?.isPhantom && !hasCheckedConnection) {
          // Only check for trusted connections to prevent popup
          const response = await provider.connect({ onlyIfTrusted: true })
          if (response?.publicKey) {
            setWalletAddress(response.publicKey.toString())
            setWalletConnected(true)
          }
        }
      } catch (error) {
        // User has not connected their wallet yet or connection was rejected
        console.log("No trusted wallet connection found")
      } finally {
        setHasCheckedConnection(true)
      }
    }

    // Handle clicks outside mobile menu to close it
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    if (!hasCheckedConnection) {
      // Add delay to ensure page is loaded
      setTimeout(checkWalletConnection, 1500)
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, hasCheckedConnection])

  const connectWallet = async () => {
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const provider = window.solana || window.phantom?.solana

      if (!provider?.isPhantom) {
        if (isMobile) {
          // Redirect to Phantom app or app store
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          if (isIOS) {
            window.open("https://apps.apple.com/app/phantom-solana-wallet/id1598432977", "_blank")
          } else {
            window.open("https://play.google.com/store/apps/details?id=app.phantom", "_blank")
          }
        } else {
          alert("Phantom wallet is not installed. Please install it from https://phantom.app/")
        }
        return
      }

      // This will show the connection popup when user explicitly clicks
      const response = await provider.connect()
      setWalletAddress(response.publicKey.toString())
      setWalletConnected(true)
    } catch (err) {
      console.error("Error connecting to wallet:", err)
      if (err.code === 4001) {
        // User rejected the connection - don't show error
        console.log("User cancelled wallet connection")
      }
    }
  }

  const disconnectWallet = () => {
    try {
      const { solana } = window
      if (solana && solana.isPhantom) {
        solana.disconnect()
      }
    } catch (err) {
      console.error("Error disconnecting wallet:", err)
    }

    setWalletConnected(false)
    setWalletAddress("")
    setHasCheckedConnection(false) // Reset connection check
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Whitepaper", path: "/whitepaper" },
    { name: "Airdrop", path: "/airdrop" },
    { name: "Wallet", path: "/wallet" },
    { name: "Mini Game", path: "/mini-game" },
  ]

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/20 dark:border-gray-700/20"
          : "bg-black/60 backdrop-blur-md border-b border-white/20"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-20 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  scrolled ? "bg-green-100 dark:bg-green-900/50" : "bg-green-400/20"
                }`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <Leaf
                className={`h-5 w-5 sm:h-6 sm:w-6 relative z-10 transition-colors ${
                  scrolled
                    ? "text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300"
                    : "text-green-400 group-hover:text-green-300"
                }`}
              />
            </div>
            <span
              className={`text-lg sm:text-xl font-bold bg-clip-text text-transparent transition-all duration-300 ${
                scrolled
                  ? "bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300"
                  : "bg-gradient-to-r from-green-300 to-green-100"
              }`}
            >
              EcoCoin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-all duration-300 ${
                  activeLink === link.path
                    ? scrolled
                      ? "text-green-600 dark:text-green-400"
                      : "text-green-300 shadow-lg"
                    : scrolled
                      ? "text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                      : "text-white hover:text-green-300 hover:shadow-md"
                }`}
              >
                {activeLink === link.path && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className={`absolute inset-0 rounded-md -z-10 ${
                      scrolled
                        ? "bg-green-50 dark:bg-green-900/30"
                        : "bg-white/10 backdrop-blur-sm border border-white/20"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className={`relative z-10 ${!scrolled ? "drop-shadow-sm" : ""}`}>{link.name}</span>
              </Link>
            ))}

            {walletConnected ? (
              <div className="relative group ml-2">
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm py-2 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  <span className="font-mono">
                    {walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">Connected Wallet</div>
                    <div className="px-3 py-2 text-sm font-mono break-all text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                      {walletAddress}
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md mt-1 transition-colors"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="ml-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm py-2 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className={`md:hidden z-20 p-2 rounded-md transition-all duration-300 ${
              scrolled
                ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                : "text-white hover:bg-white/10 backdrop-blur-sm"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6 drop-shadow-sm" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6 drop-shadow-sm" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-white dark:bg-gray-900 z-10 md:hidden overflow-hidden"
            aria-hidden={!isOpen}
          >
            <div className="flex flex-col h-full pt-20">
              {/* Navigation Links */}
              <div className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={link.path}
                      className={`flex items-center px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                        activeLink === link.path
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-l-4 border-green-600 dark:border-green-400 shadow-sm"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{link.name}</span>
                      {activeLink === link.path && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Wallet Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="px-6 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                {walletConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Wallet</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                        {walletAddress}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet()
                        setIsOpen(false)
                      }}
                      className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 px-4 rounded-lg transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/30 active:bg-red-200 dark:active:bg-red-900/40 font-medium border border-red-200 dark:border-red-800 text-base"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      connectWallet()
                      setIsOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 active:from-green-800 active:to-green-700 text-white py-4 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md font-medium text-base"
                  >
                    Connect Wallet
                  </button>
                )}
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="px-6 py-6 bg-gray-100 dark:bg-gray-800"
              >
                <div className="flex justify-center space-x-8">
                  <a
                    href="https://t.me/ecocoinglobal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center active:scale-95">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.302 1.507-1.123 1.507-1.123 1.507s-.821 0-1.124-1.507c0 0-.727-4.87-.896-6.728-.154-1.69.896-2.233.896-2.233s1.05.543.896 2.233z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">Telegram</span>
                  </a>
                  <a
                    href="https://x.com/Ecocoin_Eco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center active:scale-95">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium">Twitter</span>
                  </a>
                </div>
                <div className="text-center mt-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Follow us for updates</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
