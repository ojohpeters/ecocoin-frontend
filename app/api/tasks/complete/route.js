import { NextResponse } from "next/server"
import { completeTask } from "@/lib/db"

// Mock tasks data
const TASKS = {
  "a1887390-5034-4e36-a392-8735f3fc3ea7": { name: "Follow Twitter", points: 200 },
  "f239cd91-d264-4f1e-b378-d2f0ef34212a": { name: "Join Telegram", points: 100 },
  "fcf93f51-b203-4e67-bad7-f962401a2894": { name: "Subscribe YouTube", points: 200 },
  "e5c93f51-b203-4e67-bad7-f962401a2895": { name: "Follow Instagram", points: 150 },
  "10b9f158-e5e7-4a38-a7db-40327d45e6f6": { name: "Invite 5 Friends", points: 350 },
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { wallet_address, task_id } = body

    if (!wallet_address || !task_id) {
      return NextResponse.json({ error: "Wallet address and task ID are required" }, { status: 400 })
    }

    // Check if task exists
    const task = TASKS[task_id]
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Complete the task
    const result = completeTask(wallet_address, task_id, task.points)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      points: result.user.points,
      completedTasks: result.user.completedTasks,
    })
  } catch (error) {
    console.error("Error completing task:", error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}
