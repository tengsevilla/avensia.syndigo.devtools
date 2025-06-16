"use client"

import { Button } from "@/components/ui/button";
import { CSVColumns, UploadCSVFile } from "@/components/UploadCSVFile2"
import { fetcher } from "@/lib/fetcher";
import { useState } from "react"
import useSWR from "swr"

export default function Page() {
    const [taskId, setTaskId] = useState<string | null>(null);
    const [completedBatches, setCompletedBatches] = useState<
        { taskId: string; batchIndex: number; result: any }[]
    >([]);
    const [isProcessing, setIsProcessing] = useState(false);



    const [rowsBatch, setRowsBatch] = useState<CSVColumns[][]>([]);

    const handleStart = async () => {
        if (rowsBatch.length === 0) {
            alert("No data to process.");
            return;
        }
        setIsProcessing(true)
        try {
            for (let i = 0; i < rowsBatch.length; i++) {
                const batch = rowsBatch[i];

                // 1. Request a new taskId for this batch
                const resInit = await fetch("/api/update-entity", { method: "POST" });
                const initData = await resInit.json();
                const taskId = initData.taskId;
                setTaskId(taskId);

                // 2. Submit batch
                const res = await fetch("/api/update-entity", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ taskId, batchIndex: i, rows: batch }),
                });

                const data = await res.json();
                if (!res.ok) {
                    console.error(`❌ Batch ${i} failed:`, data);
                    break;
                }

                console.log(`🚀 Batch ${i} submitted with taskId ${taskId}. Waiting for completion...`);

                // 3. Poll for completion
                let maxTries = 900; // 5 minutes max (150 * 2 seconds)
                let completed = false;

                while (maxTries-- > 0) {
                    await new Promise((r) => setTimeout(r, 2000));
                    const statusRes = await fetch(`/api/update-entity/status/${taskId}`);
                    const statusData = await statusRes.json();
                    if (statusData.status === "completed") {
                        console.log(`✅ Batch ${i} (taskId: ${taskId}) completed.`);
                        // Add to completed batch list
                        setCompletedBatches((prev) => [
                            ...prev,
                            { taskId, batchIndex: i, result: statusData },
                        ]);

                        completed = true;
                        break;
                    } else if (statusData.status === "error") {
                        console.error(`❌ Error in batch ${i}:`, statusData.message);
                        return;
                    }
                }

                if (!completed) {
                    console.error(`⏱️ Timeout for batch ${i}`);
                    return;
                }
            }
            console.log("✅ All batches processed.");
            setIsProcessing(false);
        } catch (err) {
            console.error("❌ Error processing batches:", err);
        }
    };




    const { data, error } = useSWR(
        taskId ? `/api/update-entity/status/${taskId}` : null,
        fetcher,
        {
            refreshInterval: 1000,
        }
    )

    return (
        <div>
            <UploadCSVFile
                isProcessing={isProcessing}
                onUpload={setRowsBatch}
                onClear={() => {
                    setRowsBatch([]);
                    setTaskId(null);
                    setCompletedBatches([]);
                }}
            />
            <div className="flex gap-4 items-center">
                <Button
                    onClick={handleStart}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 mt-8"
                    disabled={isProcessing || rowsBatch.length === 0}
                    isLoading={isProcessing}
                >
                    Start Background Job
                </Button>
                {(isProcessing || taskId) && (
                    <div className="text-sm text-gray-500 mt-8">

                        Refresh the page to cancel the job
                    </div>
                )}
            </div>
            {taskId && (
                <div className="mt-6 space-y-2 border-t pt-4">
                    <p className="text-gray-700"><strong>Task ID:</strong> {taskId}</p>
                    {error && <p className="text-red-600">Error fetching status.</p>}
                    {!data && <p className="text-gray-500">Checking task status...</p>}
                    {data && (
                        <>
                            <p className="text-gray-700"><strong>Status:</strong> {data.status}</p>
                            {data.count && <p className="text-gray-700"><strong>Count:</strong> {data.count}</p>}
                            {data.message && <p className="text-gray-600"><strong>Message:</strong> {data.message}</p>}
                        </>
                    )}
                </div>
            )}

            {completedBatches.length > 0 && (
                <div className="mt-8">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg text-blue-700 flex items-center gap-2">
                            <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs">✅</span>
                            Logging
                        </h3>
                        <p className="text-sm text-green-700 mt-1 bg-green-50 rounded px-3 py-1 shadow-sm">
                            {rowsBatch.length > 0 &&
                                `Completed a total of ${rowsBatch.reduce((a, b) => a + b.length, 0)} rows in ${rowsBatch.length} batches.`}
                        </p>
                    </div>
                    <table className="w-full text-sm border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">Batch</th>
                                <th className="p-2 border">Task ID</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Count</th>
                                <th className="p-2 border">Message</th>
                                <th className="p-2 border">Failed IDs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedBatches.map(({ taskId, batchIndex, result }) => (
                                <tr key={taskId} className="border-t">
                                    <td className="p-2 border">{batchIndex + 1}</td>
                                    <td className="p-2 border">{taskId.slice(0, 8)}...</td>
                                    <td className="p-2 border text-green-600">{result.status}</td>
                                    <td className="p-2 border">{result.count ?? "-"}</td>
                                    <td className="p-2 border">{result.message ?? "-"}</td>
                                    <td className="p-2 border text-red-500 whitespace-pre-wrap">
                                        {Array.isArray(result.failedIds) && result.failedIds.length > 0
                                            ? result.failedIds.join(", ")
                                            : "None"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div >
    )
}
