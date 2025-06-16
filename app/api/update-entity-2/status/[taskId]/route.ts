// app/api/external-api/status/[taskId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getTask } from "@/lib/taskStore"

export async function GET(
    request: NextRequest,
    context: { params: { taskId: string } } // ✅ No Promise
) {
    const { taskId } = await context.params        // ✅ Safe to access here
    const task = getTask(taskId)
    return NextResponse.json(task)
}
