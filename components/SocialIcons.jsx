"use client"

import { Twitter, Youtube, Instagram, Users, MessageCircle } from "lucide-react"

export function getSocialIcon(taskName) {
  const name = taskName.toLowerCase()

  if (name.includes("twitter")) {
    return <Twitter className="w-5 h-5 text-blue-500" />
  } else if (name.includes("youtube")) {
    return <Youtube className="w-5 h-5 text-red-600" />
  } else if (name.includes("instagram")) {
    return <Instagram className="w-5 h-5 text-pink-600" />
  } else if (name.includes("telegram")) {
    return <MessageCircle className="w-5 h-5 text-blue-400" />
  } else if (name.includes("invite") || name.includes("friend") || name.includes("referral")) {
    return <Users className="w-5 h-5 text-blue-600" />
  }

  return null
}
