// app/api/external-proxy/route.ts
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { fetchAPI } from "@/lib/fetchAPI"
import { createTask, updateTask } from "@/lib/taskStore"

export async function POST() {
    try {
        const taskId = uuidv4();
        createTask(taskId);
        return NextResponse.json({ taskId });
    } catch (err) {
        console.error("Failed to create task:", err);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const { taskId, batchIndex, rows } = await req.json();

    if (!taskId || !rows || !Array.isArray(rows)) {
        return NextResponse.json({ error: "Missing or invalid payload" }, { status: 400 });
    }

    let x = 0;
    let err: string[] = [];

    // console.log("Received PUT request:", { taskId, batchIndex, rows });
    createTask(taskId);

    (async () => {
        const startTime = Date.now(); // ⏱ Start timer

        try {
            for (let i = 0; i < rows.length; i++) {
                const data = await fetchAPI("/entityappservice/update", "POST", {
                    entity: {
                        id: rows[i].ID,
                        type: rows[i].Type,
                        data: {
                            attributes: {
                                thgWorkflowMDMStatus: {
                                    values: [
                                        {
                                            value: rows[i].AttributeValue,
                                            locale: "nb-NO",
                                            source: "internal",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                });
                x++;
                updateTask(taskId, {
                    status: "running",
                    count: x,
                    message: `Salgsklar lProcessing batch ${batchIndex + 1} | Check id: ${rows[i].ID}`,
                });

                if (data.response.status !== "success") {
                    err.push(data.response.data);
                }
            }

            const endTime = Date.now(); // ⏱ End timer
            const durationMs = endTime - startTime;
            const durationSec = (durationMs / 1000).toFixed(2);

            updateTask(taskId, {
                status: "completed",
                count: x,
                message: `Batch ${batchIndex + 1} completed in ${durationSec}s | Failed: ${err.length}`,
                failedIds: err,
            });
        } catch (error: any) {
            console.error("API error:", error);
            updateTask(taskId, {
                status: "error",
                message: error.message || "Unknown error",
            });
        }
    })();

    return NextResponse.json({ taskId });
}
