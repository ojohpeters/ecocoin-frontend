"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, Leaf } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      try {
        const { solana } = window
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true })
          setWalletAddress(response.publicKey.toString())
          setWalletConnected(true)
        }
      } catch (error) {
        // User has not connected their wallet yet or connection was rejected
        console.log("Wallet not connected", error)
      }
    }

    // Handle clicks outside mobile menu to close it
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    checkWalletConnection()
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const connectWallet = async () => {
    try {
      const { solana } = window

      if (!solana || !solana.isPhantom) {
        alert("Phantom wallet is not installed. Please install it from https://phantom.app/")
        return
      }

      const response = await solana.connect()
      setWalletAddress(response.publicKey.toString())
      setWalletConnected(true)
    } catch (err) {
      console.error("Error connecting to wallet:", err)
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
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2 z-20">
            <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <span className="text-lg sm:text-xl font-bold text-green-600">EcoCoin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm lg:text-base"
            >
              Home
            </Link>
            <Link
              href="/whitepaper"
              className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm lg:text-base"
            >
              Whitepaper
            </Link>
            <Link
              href="/airdrop"
              className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm lg:text-base"
            >
              Airdrop
            </Link>
            <Link
              href="/wallet"
              className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm lg:text-base"
            >
              Wallet
            </Link>
            <Link
              href="/mini-game"
              className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm lg:text-base"
            >
              Mini Game
            </Link>
            {walletConnected ? (
              <button
                onClick={disconnectWallet}
                className="eco-button-primary text-sm py-2 px-3 lg:px-4"
                aria-label="Disconnect wallet"
              >
                {walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)}
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="eco-button-primary text-sm py-2 px-3 lg:px-4"
                aria-label="Connect wallet"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200 z-20"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 bg-white dark:bg-gray-900 z-10 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="container mx-auto px-4 pt-20 pb-6 h-full flex flex-col">
          <div className="flex-grow space-y-6">
            <Link
              href="/"
              className="block text-xl text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/whitepaper"
              className="block text-xl text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Whitepaper
            </Link>
            <Link
              href="/airdrop"
              className="block text-xl text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Airdrop
            </Link>
            <Link
              href="/wallet"
              className="block text-xl text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Wallet
            </Link>
            <Link
              href="/mini-game"
              className="block text-xl text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Mini Game
            </Link>
          </div>
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            {walletConnected ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Connected wallet:</div>
                <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm break-all">
                  {walletAddress}
                </div>
                <button onClick={disconnectWallet} className="eco-button-primary w-full">
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="eco-button-primary w-full">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
