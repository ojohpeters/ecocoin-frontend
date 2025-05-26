"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  FaLeaf,
  FaHandsHelping,
  FaExchangeAlt,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa"
import { BsFillPeopleFill, BsGlobe2 } from "react-icons/bs"

const sections = [
  {
    title: "Introduction",
    icon: <FaLeaf className="text-green-500 text-3xl" />,
    content:
      "With the emergence of cryptocurrencies, especially in recent years, the need to create a currency aimed at protecting the environment and sustainability has become more and more felt. Eco Token is designed as an innovative digital currency, with the aim of raising awareness of environmental issues and encouraging environmentally friendly behavior.",
    visual: "/placeholder.svg?height=400&width=400",
    visualAlt: "Eco Token Introduction",
    visualType: "image",
    bgColor: "from-green-50 to-green-100",
  },
  {
    title: "Purpose of Eco Token",
    icon: <BsGlobe2 className="text-green-500 text-3xl" />,
    content:
      "The main goal of Eco Token is to provide a financial platform that allows users to help protect the environment in addition to making financial transactions. Each transaction made with Eco Token automatically allocates a percentage of the amount to environmental projects.",
    visual: "/placeholder.svg?height=400&width=400",
    visualAlt: "Eco Token Purpose",
    visualType: "globe",
    bgColor: "from-green-100 to-green-50",
  },
  {
    title: "Unique Features",
    icon: <FaCheckCircle className="text-green-500 text-3xl" />,
    list: [
      {
        icon: <FaHandsHelping className="text-green-500" />,
        text: "Supporting Projects: Investing in projects related to the protection of forests, water resources and renewable energy.",
      },
      {
        icon: <BsFillPeopleFill className="text-green-500" />,
        text: "Incentive System: Users can earn additional tokens by participating in green activities, such as reducing energy consumption or using public transportation.",
      },
      {
        icon: <FaChartLine className="text-green-500" />,
        text: "Transparency: All transactions and interactions are transparently recorded on the blockchain to ensure that investments are made in real and effective projects.",
      },
    ],
    visual: "/placeholder.svg?height=400&width=400",
    visualAlt: "Eco Token Features",
    visualType: "features",
    bgColor: "from-green-50 to-green-100",
  },
  {
    title: "Methods to earn Eco Token",
    icon: <FaExchangeAlt className="text-green-500 text-3xl" />,
    list: [
      { text: "Direct purchase: Users can buy Eco Token from reputable exchanges." },
      { text: "Exchange with other currencies: Exchange Eco Token for other cryptocurrencies." },
      {
        text: "Participation in green projects: Earn tokens by participating in environmental programs and social activities.",
      },
    ],
    visual: "/placeholder.svg?height=400&width=400",
    visualAlt: "Earn Eco Token",
    visualType: "earn",
    bgColor: "from-green-100 to-green-50",
  },
  {
    title: "Disadvantages & Challenges",
    icon: <FaExclamationTriangle className="text-yellow-500 text-3xl" />,
    list: [
      {
        text: "Public acceptance: One of the main challenges is the need to build trust and public acceptance for the use of Eco Token.",
      },
      { text: "Market volatility: Like other cryptocurrencies, Eco Token is also affected by market fluctuations." },
    ],
    visual: "/placeholder.svg?height=400&width=400",
    visualAlt: "Eco Token Challenges",
    visualType: "challenges",
    bgColor: "from-yellow-50 to-orange-50",
  },
  {
    title: "Conclusion",
    icon: <FaLeaf className="text-green-500 text-3xl" />,
    content:
      "Eco Token is not only a digital currency, but also a movement towards creating a more sustainable and greener future. With the aim of promoting environmentally friendly behaviors and supporting environmental projects, Eco Token can be not only a financial investment but also an investment in the future of our earth. Let's move towards a better and more sustainable future together!",
    visual: "/placeholder.svg?height=400&width=400",
    visualAlt: "Eco Token Conclusion",
    visualType: "conclusion",
    bgColor: "from-green-100 to-green-200",
  },
]

// Pre-calculated positions for challenges dots to avoid hydration mismatches
const challengePositions = [
  { top: "10%", left: "50%" },
  { top: "30%", left: "85%" },
  { top: "70%", left: "85%" },
  { top: "90%", left: "50%" },
  { top: "70%", left: "15%" },
  { top: "30%", left: "15%" },
]

// Pre-calculated positions for conclusion leaves
const leafPositions = [
  { top: "10%", left: "50%" },
  { top: "25%", left: "75%" },
  { top: "50%", left: "90%" },
  { top: "75%", left: "75%" },
  { top: "90%", left: "50%" },
  { top: "75%", left: "25%" },
  { top: "50%", left: "10%" },
  { top: "25%", left: "25%" },
]

// Visual components for each section
const VisualComponent = ({ type, image }) => {
  switch (type) {
    case "globe":
      return (
        <div className="relative w-full h-64 md:h-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <motion.div
                className="absolute inset-0 rounded-full bg-green-200/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute inset-8 rounded-full bg-green-300/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, delay: 0.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute inset-16 rounded-full bg-green-400/50 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <BsGlobe2 className="text-green-600 text-5xl" />
              </motion.div>
            </div>
          </div>
        </div>
      )
    case "features":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { icon: <FaHandsHelping className="text-green-500 text-2xl" />, label: "Supporting Projects" },
            { icon: <BsFillPeopleFill className="text-green-500 text-2xl" />, label: "Incentive System" },
            { icon: <FaChartLine className="text-green-500 text-2xl" />, label: "Transparency" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1 }}
              >
                {feature.icon}
              </motion.div>
              <h4 className="font-medium text-green-800">{feature.label}</h4>
            </motion.div>
          ))}
        </div>
      )
    case "earn":
      return (
        <div className="relative w-full h-64 md:h-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  initial={{ y: -20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1 }}
                >
                  ECO
                </motion.div>
              ))}
            </div>
            <motion.div
              className="absolute bottom-0 w-full flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-green-100 rounded-full px-6 py-2 text-green-800 font-medium flex items-center gap-2">
                <FaExchangeAlt /> Earn & Exchange
              </div>
            </motion.div>
          </div>
        </div>
      )
    case "challenges":
      return (
        <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
          <div className="w-64 h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 rounded-full bg-yellow-200/30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                />
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaExclamationTriangle className="text-yellow-600 text-2xl" />
                </div>
              </div>
            </div>
            {challengePositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-yellow-400"
                style={{ top: pos.top, left: pos.left }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Number.POSITIVE_INFINITY }}
              />
            ))}
          </div>
        </div>
      )
    case "conclusion":
      return (
        <div className="relative w-full h-64 md:h-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {leafPositions.map((pos, i) => (
                <motion.div
                  key={i}
                  className="absolute w-10 h-10 flex items-center justify-center"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, delay: i * 0.2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <FaLeaf className="text-green-600" />
                  </motion.div>
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  ECO
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-2xl shadow-lg">
          <Image src={image || "/placeholder.svg?height=400&width=400"} alt="Eco Token" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent flex items-end p-6">
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-green-800 font-medium"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Eco Token
            </motion.div>
          </div>
        </div>
      )
  }
}

const AboutSection = () => {
  const containerRef = useRef(null)

  return (
    <section className="py-20" id="about" ref={containerRef}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
            About Eco Token
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn how Eco Token is revolutionizing the intersection of cryptocurrency and environmental sustainability.
          </p>
        </motion.div>

        <div className="space-y-32">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              className={`rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${section.bgColor} p-6 md:p-10`}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div
                className={`flex flex-col ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-16 items-center`}
              >
                {/* Text Block */}
                <div className="space-y-6 md:w-1/2">
                  <motion.div
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 w-fit shadow-md"
                    initial={{ x: idx % 2 === 0 ? -50 : 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {section.icon}
                    <h3 className="text-2xl md:text-3xl font-bold text-green-700">{section.title}</h3>
                  </motion.div>

                  {section.content && (
                    <motion.p
                      className="text-lg leading-relaxed text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      {section.content}
                    </motion.p>
                  )}

                  {section.list && (
                    <motion.ul
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      {section.list.map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                          viewport={{ once: true }}
                          whileHover={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {item.icon ? (
                            <span className="mt-1">{item.icon}</span>
                          ) : (
                            <span className="mt-1 text-green-500">
                              <FaArrowRight />
                            </span>
                          )}
                          <span className="text-gray-700">{item.text}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </div>

                {/* Visual Side */}
                <motion.div
                  className="md:w-1/2 bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <VisualComponent type={section.visualType} image={section.visual} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <a
            href="/airdrop"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-full font-medium shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 group"
          >
            Join the Eco Token Movement
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              className="inline-block"
            >
              <FaArrowRight />
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
