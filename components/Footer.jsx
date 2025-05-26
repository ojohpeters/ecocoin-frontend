import Link from "next/link"
import { Leaf, Mail, MessageCircle, Twitter, Instagram, Youtube } from "lucide-react"

const SUPPORT_EMAIL = "Support@ecotp.org"
const TOKEN_MINT_ADDRESS = "DkrCNNn27B1Loz6eGpMYKAL7b5J4GY6wwQs8wqY9ERBT"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-300">
                EcoCoin
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              A sustainability-focused cryptocurrency built on Solana, designed to incentivize and fund environmentally
              friendly initiatives.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://t.me/ecocoinglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/Ecocoin_Eco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/ecocoin.eco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@NightStories2025"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/whitepaper" className="text-gray-300 hover:text-green-400 transition-colors">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="/airdrop" className="text-gray-300 hover:text-green-400 transition-colors">
                  Airdrop
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-gray-300 hover:text-green-400 transition-colors">
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="/mini-game" className="text-gray-300 hover:text-green-400 transition-colors">
                  Mini Game
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Support</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gray-300 hover:text-green-400 transition-colors">
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <p className="text-sm text-gray-400">
                For technical support, partnership inquiries, or general questions about EcoCoin.
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Airdrop Address:</p>
                <p className="text-xs font-mono text-gray-500 break-all">{TOKEN_MINT_ADDRESS}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 EcoCoin. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
