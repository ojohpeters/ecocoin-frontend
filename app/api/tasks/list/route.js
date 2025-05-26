import { NextResponse } from "next/server"

// Mock tasks data
const TASKS = [
  {
    id: "a1887390-5034-4e36-a392-8735f3fc3ea7",
    name: "Follow Twitter",
    points: 200,
    link: "https://x.com/Ecocoin_Eco",
    icon: "Twitter",
  },
  {
    id: "f239cd91-d264-4f1e-b378-d2f0ef34212a",
    name: "Join Telegram",
    points: 100,
    link: "https://t.me/ecocoinglobal",
    icon: "Telegram",
  },
  {
    id: "fcf93f51-b203-4e67-bad7-f962401a2894",
    name: "Subscribe YouTube",
    points: 200,
    link: "https://www.youtube.com/@NightStories2025",
    icon: "Youtube",
  },
  {
    id: "e5c93f51-b203-4e67-bad7-f962401a2895",
    name: "Follow Instagram",
    points: 150,
    link: "https://www.instagram.com/ecocoin.eco",
    icon: "Instagram",
  },
  {
    id: "10b9f158-e5e7-4a38-a7db-40327d45e6f6",
    name: "Invite 5 Friends",
    points: 350,
    icon: "Users",
  },
]

export async function GET() {
  try {
    return NextResponse.json(TASKS)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}
