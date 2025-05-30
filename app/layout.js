import "./globals.css"
import { Inter } from "next/font/google"
import Footer from "@/components/Footer"
import DevelopmentBanner from "@/components/DevelopmentBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EcoCoin - Sustainable Cryptocurrency",
  description: "Join the green revolution with EcoCoin - earn rewards for environmental actions",
  generator: '0xb17'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="pt-16">
          {" "}
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
