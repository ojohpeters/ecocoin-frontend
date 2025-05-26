"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Leaf, Users, Globe, Zap, ArrowRight, CheckCircle, TrendingUp, Shield, Coins, Target } from "lucide-react"
import Link from "next/link"
import AboutSection from "@/components/AboutSection"
import RoadmapSection from "@/components/RoadmapSection"
import Navbar from "@/components/Navbar"
import { ToastProvider } from "@/components/SimpleToast"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalWallets: 0,
    tokensDistributed: 0,
    projectsFunded: 0,
  })

  useEffect(() => {
    setMounted(true)

    // Animate stats on mount
    const animateStats = () => {
      const targetStats = {
        totalWallets: 12500,
        tokensDistributed: 50000000,
        projectsFunded: 25,
      }

      const duration = 2000 // 2 seconds
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setStats({
          totalWallets: Math.floor(targetStats.totalWallets * progress),
          tokensDistributed: Math.floor(targetStats.tokensDistributed * progress),
          projectsFunded: Math.floor(targetStats.projectsFunded * progress),
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setStats(targetStats)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }

    const timer = setTimeout(animateStats, 500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div
              className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Leaf className="w-4 h-4" />
                  Sustainable Cryptocurrency on Solana
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-green-500 to-green-400 dark:from-green-400 dark:via-green-300 dark:to-green-200">
                  EcoCoin
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  The world's first cryptocurrency designed to fund environmental projects and reward sustainable
                  behavior. Every transaction makes a difference.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <Link
                  href="/airdrop"
                  className="group bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Claim Airdrop
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>

                <Link
                  href="/whitepaper"
                  className="group bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Read Whitepaper
                  <CheckCircle className="w-5 h-5 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" />
                </Link>
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {stats.totalWallets.toLocaleString()}+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Wallets Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {(stats.tokensDistributed / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tokens Distributed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {stats.projectsFunded}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projects Funded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">100%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Renewable Energy</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Why Choose EcoCoin?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                EcoCoin combines cutting-edge blockchain technology with environmental impact, creating a sustainable
                financial ecosystem for the future.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />,
                  title: "Environmental Impact",
                  description: "Every transaction automatically funds verified environmental projects worldwide.",
                },
                {
                  icon: <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "Secure & Transparent",
                  description: "Built on Solana blockchain with full transparency and security for all transactions.",
                },
                {
                  icon: <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
                  title: "Earn Rewards",
                  description: "Get rewarded for sustainable actions and environmental contributions.",
                },
                {
                  icon: <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
                  title: "Community Driven",
                  description: "Join a global community committed to environmental sustainability.",
                },
                {
                  icon: <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
                  title: "Sustainable Growth",
                  description: "Designed for long-term value creation and environmental benefit.",
                },
                {
                  icon: <Target className="w-8 h-8 text-red-600 dark:text-red-400" />,
                  title: "Measurable Results",
                  description: "Track real environmental impact with transparent reporting and metrics.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                How EcoCoin Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Simple steps to start making a positive environmental impact with cryptocurrency.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  description: "Connect your Phantom wallet and join the EcoCoin ecosystem.",
                  icon: <Globe className="w-12 h-12 text-green-600 dark:text-green-400" />,
                },
                {
                  step: "02",
                  title: "Complete Tasks",
                  description: "Earn points by completing social media tasks and environmental actions.",
                  icon: <CheckCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
                },
                {
                  step: "03",
                  title: "Claim Tokens",
                  description: "Use your points to claim EcoCoin tokens and start making an impact.",
                  icon: <Zap className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <div className="mb-6 flex justify-center">{step.icon}</div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Roadmap Section */}
        <RoadmapSection />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-green-500">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Make a Difference?</h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already earning EcoCoin tokens while contributing to environmental
                sustainability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/airdrop"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Start Earning Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/whitepaper"
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Learn More
                  <CheckCircle className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </ToastProvider>
  )
}
