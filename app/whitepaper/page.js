"use client"

import { useState, useEffect } from "react"
import { Download, FileText, Users, Zap } from "lucide-react"
import { motion } from "framer-motion"
import "./whitepaper.css"

// Inline constants
const TOKENOMICS = [
  { allocation: "Airdrop", percentage: 5, amount: 50000000 },
  { allocation: "IPO & Pre-Sale", percentage: 35, amount: 350000000 },
  { allocation: "Exchange Trading", percentage: 10, amount: 100000000 },
  { allocation: "Token Burning", percentage: 20, amount: 200000000 },
  { allocation: "Locked Release", percentage: 20, amount: 200000000 },
  { allocation: "Environmental Protection", percentage: 5, amount: 50000000 },
  { allocation: "Team", percentage: 5, amount: 50000000 },
]

const SUPPORT_EMAIL = "Support@ecotp.org"
const TOKEN_NAME = "EcoCoin"
const TOKEN_SYMBOL = "ECO"
const TOTAL_SUPPLY = 1000000000

export default function WhitepaperPage() {
  const [activeSection, setActiveSection] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + 100

      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once to set initial active section

    return () => window.removeEventListener("scroll", handleScroll)
  }, [isClient])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const tableOfContents = [
    { id: "introduction", title: "Introduction", level: 1 },
    { id: "problem-statement", title: "Problem Statement", level: 1 },
    { id: "solution", title: "Our Solution", level: 1 },
    { id: "tokenomics", title: "Tokenomics", level: 1 },
    { id: "technology", title: "Technology", level: 1 },
    { id: "roadmap", title: "Roadmap", level: 1 },
    { id: "team", title: "Team", level: 1 },
    { id: "conclusion", title: "Conclusion", level: 1 },
  ]

  if (!isClient) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300">
              EcoCoin Whitepaper
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A comprehensive guide to EcoCoin's mission, technology, and roadmap for creating a sustainable future
              through blockchain innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button className="eco-button-primary flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => scrollToSection("introduction")}
                className="eco-button-secondary flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Read Online
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <motion.div
              className="lg:w-1/4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Table of Contents</h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`toc-link w-full text-left text-sm transition-colors ${
                        activeSection === item.id ? "active" : ""
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              className="lg:w-3/4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <article className="prose prose-lg max-w-none whitepaper-content bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                {/* Introduction */}
                <section id="introduction">
                  <h2>Introduction</h2>
                  <p>
                    With the emergence of cryptocurrencies, especially in recent years, the need to create a currency
                    aimed at protecting the environment and sustainability has become more and more felt. EcoCoin is
                    designed as an innovative digital currency, with the aim of raising awareness of environmental
                    issues and encouraging environmentally friendly behavior.
                  </p>
                  <p>
                    Built on the Solana blockchain, EcoCoin represents a new paradigm in sustainable finance, where
                    every transaction contributes to environmental protection and restoration efforts worldwide.
                  </p>
                </section>

                {/* Problem Statement */}
                <section id="problem-statement">
                  <h2>Problem Statement</h2>
                  <p>
                    The world faces unprecedented environmental challenges that require immediate and sustained action:
                  </p>
                  <ul>
                    <li>
                      <strong>Climate Change:</strong> Rising global temperatures and extreme weather events threaten
                      ecosystems and human communities worldwide.
                    </li>
                    <li>
                      <strong>Deforestation:</strong> Rapid loss of forest cover reduces biodiversity and increases
                      carbon emissions.
                    </li>
                    <li>
                      <strong>Ocean Pollution:</strong> Plastic waste and chemical pollutants are destroying marine
                      ecosystems.
                    </li>
                    <li>
                      <strong>Resource Depletion:</strong> Unsustainable consumption patterns are exhausting natural
                      resources.
                    </li>
                    <li>
                      <strong>Lack of Funding:</strong> Environmental projects often struggle to secure adequate funding
                      for implementation.
                    </li>
                  </ul>
                  <p>
                    Traditional financial systems have been slow to address these challenges, creating a need for
                    innovative solutions that can mobilize resources and incentivize sustainable behavior at scale.
                  </p>
                </section>

                {/* Solution */}
                <section id="solution">
                  <h2>Our Solution</h2>
                  <p>
                    EcoCoin addresses these challenges through a comprehensive ecosystem that combines blockchain
                    technology with environmental action:
                  </p>

                  <h3>Core Features</h3>
                  <ul>
                    <li>
                      <strong>Automatic Environmental Funding:</strong> A percentage of every transaction is
                      automatically allocated to verified environmental projects.
                    </li>
                    <li>
                      <strong>Incentive System:</strong> Users earn additional tokens by participating in green
                      activities, such as reducing energy consumption or using public transportation.
                    </li>
                    <li>
                      <strong>Transparency:</strong> All transactions and environmental investments are transparently
                      recorded on the blockchain.
                    </li>
                    <li>
                      <strong>Community Governance:</strong> Token holders can vote on which environmental projects
                      receive funding.
                    </li>
                    <li>
                      <strong>Carbon Offset Integration:</strong> Direct integration with verified carbon offset
                      programs.
                    </li>
                  </ul>

                  <h3>Environmental Impact Areas</h3>
                  <ul>
                    <li>Forest restoration and reforestation projects</li>
                    <li>Ocean cleanup and marine conservation</li>
                    <li>Renewable energy infrastructure development</li>
                    <li>Sustainable agriculture and food systems</li>
                    <li>Wildlife conservation and habitat protection</li>
                    <li>Clean water access and purification systems</li>
                  </ul>
                </section>

                {/* Tokenomics */}
                <section id="tokenomics">
                  <h2>Tokenomics</h2>
                  <p>
                    {TOKEN_NAME} ({TOKEN_SYMBOL}) has a total supply of {TOTAL_SUPPLY.toLocaleString()} tokens. The
                    distribution is designed to ensure sustainable growth while maximizing environmental impact:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    {TOKENOMICS.map((item, index) => (
                      <div
                        key={index}
                        className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <h4 className="font-bold text-green-800 dark:text-green-300">{item.allocation}</h4>
                        <p className="text-green-700 dark:text-green-400">
                          {item.percentage}% ({item.amount.toLocaleString()} tokens)
                        </p>
                      </div>
                    ))}
                  </div>

                  <h3>Token Utility</h3>
                  <ul>
                    <li>
                      <strong>Governance:</strong> Vote on environmental project funding and protocol upgrades
                    </li>
                    <li>
                      <strong>Staking:</strong> Stake tokens to earn rewards and support network security
                    </li>
                    <li>
                      <strong>Environmental Actions:</strong> Earn tokens by completing verified green activities
                    </li>
                    <li>
                      <strong>Carbon Credits:</strong> Purchase verified carbon offsets using EcoCoin
                    </li>
                    <li>
                      <strong>Ecosystem Access:</strong> Access to exclusive environmental programs and partnerships
                    </li>
                  </ul>
                </section>

                {/* Technology */}
                <section id="technology">
                  <h2>Technology</h2>
                  <p>
                    EcoCoin is built on the Solana blockchain, chosen for its energy efficiency and high-performance
                    capabilities:
                  </p>

                  <h3>Why Solana?</h3>
                  <ul>
                    <li>
                      <strong>Energy Efficient:</strong> Solana's Proof of History consensus mechanism uses
                      significantly less energy than traditional Proof of Work systems
                    </li>
                    <li>
                      <strong>High Throughput:</strong> Capable of processing thousands of transactions per second
                    </li>
                    <li>
                      <strong>Low Fees:</strong> Transaction costs remain minimal, making micro-transactions viable
                    </li>
                    <li>
                      <strong>Developer Friendly:</strong> Robust ecosystem for building decentralized applications
                    </li>
                  </ul>

                  <h3>Smart Contract Features</h3>
                  <ul>
                    <li>Automated environmental fund allocation</li>
                    <li>Transparent project funding mechanisms</li>
                    <li>Governance voting systems</li>
                    <li>Staking and reward distribution</li>
                    <li>Carbon credit marketplace integration</li>
                  </ul>

                  <h3>Security Measures</h3>
                  <ul>
                    <li>Multi-signature wallet requirements for fund management</li>
                    <li>Regular smart contract audits by leading security firms</li>
                    <li>Decentralized governance to prevent single points of failure</li>
                    <li>Transparent fund tracking and reporting</li>
                  </ul>
                </section>

                {/* Roadmap */}
                <section id="roadmap">
                  <h2>Roadmap</h2>
                  <p>Our development roadmap spans multiple phases, each building upon previous achievements:</p>

                  <div className="space-y-6 my-8">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-bold text-green-800 dark:text-green-300">Phase 1: Foundation (2024)</h4>
                      <ul className="mt-2">
                        <li>Token launch on Solana blockchain</li>
                        <li>Initial community building and partnerships</li>
                        <li>Basic wallet integration and trading functionality</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Phase 2: Growth (2025)</h4>
                      <ul className="mt-2">
                        <li>Airdrop distribution to early supporters</li>
                        <li>Exchange listings and liquidity provision</li>
                        <li>Environmental project partnerships</li>
                        <li>Mobile app development</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-blue-800 dark:text-blue-300">Phase 3: Expansion (2026)</h4>
                      <ul className="mt-2">
                        <li>Global market expansion</li>
                        <li>Mini-game and gamification features</li>
                        <li>Advanced staking mechanisms</li>
                        <li>Carbon credit marketplace launch</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-bold text-purple-800 dark:text-purple-300">Phase 4: Ecosystem (2027)</h4>
                      <ul className="mt-2">
                        <li>Dedicated blockchain network launch</li>
                        <li>Ecosystem restoration funding programs</li>
                        <li>Enterprise partnerships and integrations</li>
                        <li>Global environmental impact measurement</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Team */}
                <section id="team">
                  <h2>Team</h2>
                  <p>
                    EcoCoin is developed by a diverse team of blockchain developers, environmental scientists, and
                    sustainability experts committed to creating positive environmental impact through technology.
                  </p>

                  <h3>Core Values</h3>
                  <ul>
                    <li>
                      <strong>Transparency:</strong> All project activities and fund allocations are publicly verifiable
                    </li>
                    <li>
                      <strong>Sustainability:</strong> Every decision is evaluated for its environmental impact
                    </li>
                    <li>
                      <strong>Community:</strong> Decentralized governance ensures community input in all major
                      decisions
                    </li>
                    <li>
                      <strong>Innovation:</strong> Continuous development of new features and partnerships
                    </li>
                    <li>
                      <strong>Impact:</strong> Measurable environmental outcomes are our primary success metric
                    </li>
                  </ul>

                  <h3>Advisory Board</h3>
                  <p>
                    Our advisory board includes experts from environmental organizations, blockchain technology
                    companies, and sustainable finance institutions, ensuring that EcoCoin maintains the highest
                    standards of environmental and technical excellence.
                  </p>
                </section>

                {/* Conclusion */}
                <section id="conclusion">
                  <h2>Conclusion</h2>
                  <p>
                    EcoCoin represents more than just a digital currency—it's a movement towards creating a more
                    sustainable and environmentally conscious future. By combining the power of blockchain technology
                    with direct environmental action, we're creating a financial ecosystem that rewards positive
                    environmental behavior and funds critical conservation efforts.
                  </p>
                  <p>
                    Through our innovative tokenomics, transparent governance, and commitment to measurable
                    environmental impact, EcoCoin is positioned to become a leading force in the sustainable finance
                    revolution. Every transaction, every token earned, and every project funded brings us closer to a
                    world where financial success and environmental stewardship go hand in hand.
                  </p>
                  <p>
                    Join us in building a greener, more sustainable future. Together, we can prove that profitability
                    and environmental responsibility are not just compatible—they're inseparable.
                  </p>

                  <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Get Involved</h4>
                    <p className="text-green-700 dark:text-green-400 mb-4">
                      Ready to be part of the EcoCoin ecosystem? Start your journey today by participating in our
                      airdrop program and joining our growing community of environmental advocates.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="/airdrop"
                        className="eco-button-primary text-center flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Join Airdrop
                      </a>
                      <a
                        href="https://t.me/ecocoinglobal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="eco-button-secondary text-center flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Join Community
                      </a>
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3>Contact Information</h3>
                  <p>
                    For technical questions, partnership opportunities, or general inquiries, please contact our team:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Email Support:</p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-green-600 dark:text-green-400 hover:underline">
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </section>
              </article>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
