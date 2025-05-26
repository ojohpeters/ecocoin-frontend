"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, ChevronRight, Calendar } from "lucide-react"

const roadmapData = [
  {
    phase: "Phase 1",
    title: "Token Launch",
    period: "2024",
    description: "Initial launch of the EcoCoin token on the Solana blockchain.",
    status: "completed",
  },
  {
    phase: "Phase 2",
    title: "Airdrop Distribution",
    period: "2025",
    description: "Distribution of tokens to early supporters and community members.",
    status: "in-progress",
  },
  {
    phase: "Phase 3",
    title: "Initial Token Offering and Token Pre-Sale",
    period: "2025",
    description: "Public offering and pre-sale of EcoCoin tokens to early investors.",
    status: "upcoming",
  },
  {
    phase: "Phase 4",
    title: "Listing on a centralized Nonkyc exchange",
    period: "2025",
    description: "First major exchange listing to increase token accessibility.",
    status: "upcoming",
  },
  {
    phase: "Phase 5",
    title: "Cooperation with environmental organizations",
    period: "2025",
    description: "Partnerships with environmental NGOs and implementation of awareness programs.",
    status: "upcoming",
  },
  {
    phase: "Phase 6",
    title: "Listing on BitMart exchange",
    period: "2025",
    description: "Expansion to additional exchanges to increase liquidity and access.",
    status: "upcoming",
  },
  {
    phase: "Phase 7",
    title: "10% Token Supply Fuel",
    period: "June 2025",
    description: "Strategic allocation of 10% of token supply to fuel ecosystem growth.",
    status: "upcoming",
  },
  {
    phase: "Phase 8",
    title: "Expansion to international markets",
    period: "2025",
    description: "Global expansion and development of new platform features.",
    status: "upcoming",
  },
  {
    phase: "Phase 9",
    title: "Release of 10% of the locked token supply",
    period: "Early 2026",
    description: "Scheduled release of locked tokens to support ongoing development.",
    status: "upcoming",
  },
  {
    phase: "Phase 10",
    title: "Release of the project's mini-game",
    period: "2026",
    description: "Launch of interactive mini-game to increase engagement and token utility.",
    status: "upcoming",
  },
  {
    phase: "Phase 11",
    title: "Create and support environmental campaigns",
    period: "2026",
    description: "Funding and supporting real-world environmental initiatives.",
    status: "upcoming",
  },
  {
    phase: "Phase 12",
    title: "Burn 5% of supply",
    period: "June 2026",
    description: "Token burn to reduce supply and increase token value.",
    status: "upcoming",
  },
  {
    phase: "Phase 13",
    title: "List on CoinEx",
    period: "2026",
    description: "Further exchange expansion to increase market presence.",
    status: "upcoming",
  },
  {
    phase: "Phase 14",
    title: "Burn 5% of supply",
    period: "2026",
    description: "Second scheduled token burn to further reduce supply.",
    status: "upcoming",
  },
  {
    phase: "Phase 15",
    title: "Release 10% of locked token supply",
    period: "2027",
    description: "Second scheduled release of locked tokens for ecosystem development.",
    status: "upcoming",
  },
  {
    phase: "Phase 16",
    title: "Restore multiple ecosystems",
    period: "2027",
    description: "Direct funding for ecosystem restoration and endangered species protection.",
    status: "upcoming",
  },
  {
    phase: "Phase 17",
    title: "Launch a dedicated blockchain network",
    period: "2027",
    description: "Migration to EcoCoin's own blockchain for enhanced sustainability features.",
    status: "upcoming",
  },
]

const RoadmapSection = () => {
  const [activePhase, setActivePhase] = useState(null)
  const [visibleItems, setVisibleItems] = useState(5)
  const [showAll, setShowAll] = useState(false)

  // Set the active phase based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2
      const roadmapItems = document.querySelectorAll(".roadmap-item")

      roadmapItems.forEach((item, index) => {
        const itemTop = item.offsetTop
        const itemBottom = itemTop + item.offsetHeight

        if (scrollPosition >= itemTop && scrollPosition <= itemBottom) {
          setActivePhase(index)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  const displayedItems = showAll ? roadmapData : roadmapData.slice(0, visibleItems)

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50"
      case "in-progress":
        return "border-yellow-500 bg-yellow-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-green-50 to-white" id="roadmap">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
            Our Roadmap
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The journey ahead for EcoCoin as we build a sustainable future through blockchain technology.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-500 via-green-400 to-green-200"></div>

            {/* Timeline items */}
            <div className="space-y-12">
              {displayedItems.map((item, index) => (
                <motion.div
                  key={index}
                  className={`roadmap-item relative ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"} md:w-1/2 ${index % 2 === 0 ? "md:ml-auto" : ""}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {/* Timeline dot */}
                  <div className="absolute top-5 left-0 md:left-auto md:top-5 md:-left-3.5 md:right-auto md:-ml-px md:mr-0">
                    <div
                      className={`w-7 h-7 rounded-full border-4 ${activePhase === index ? "border-green-600 bg-white scale-125" : "border-green-400 bg-white"} shadow-md transition-all duration-300`}
                    ></div>
                  </div>

                  {/* Content card */}
                  <motion.div
                    className={`ml-8 md:ml-0 p-6 rounded-lg shadow-lg border-l-4 ${getStatusClass(item.status)} hover:shadow-xl transition-all duration-300`}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">
                        {item.phase}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {item.period}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>

                    <div className="mt-4 flex items-center">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span
                          className={`ml-2 text-sm font-medium ${item.status === "completed" ? "text-green-600" : item.status === "in-progress" ? "text-yellow-600" : "text-gray-500"}`}
                        >
                          {item.status === "completed"
                            ? "Completed"
                            : item.status === "in-progress"
                              ? "In Progress"
                              : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {!showAll && roadmapData.length > visibleItems && (
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <button
                onClick={toggleShowAll}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-full font-medium transition-colors"
              >
                Show All Phases
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {showAll && (
            <motion.div className="text-center mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={toggleShowAll}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-full font-medium transition-colors"
              >
                Show Less
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default RoadmapSection
