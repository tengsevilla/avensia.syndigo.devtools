import React, { useState } from "react";
import Papa from "papaparse";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export interface CSVColumns {
    Type: string;
    ID: string;
}

interface Props {
    onUpload?: (batches: CSVColumns[][]) => void;
    onClear?: () => void;
    isProcessing?: boolean;
}

const BATCH_SIZE = 2000;

export const UploadCSVFile = (props: Props) => {
    const [batches, setBatches] = useState<CSVColumns[][]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file || file.type !== "text/csv") {
            alert("Please upload a valid CSV file.");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Extract only `Type` and `ID`
                const filteredData: CSVColumns[] = results.data
                    .map((row: any) => ({
                        Type: row["Type"],
                        ID: row["ID"],
                        AttributeValue: row["Status MDM"],
                    }))
                    .filter((row: CSVColumns) => row.Type && row.ID);

                // Split into batches
                const chunked: CSVColumns[][] = [];
                for (let i = 0; i < filteredData.length; i += BATCH_SIZE) {
                    chunked.push(filteredData.slice(i, i + BATCH_SIZE));
                }

                setBatches(chunked);
                props.onUpload?.(chunked);
                console.log("Parsed Batches:", chunked);
            },
            error: (err) => {
                console.error("CSV Parsing Error:", err);
            },
        });
    };

    return (
        <Card>
            <CardHeader className="flex items-center gap-4">
                <CardTitle>Upload CSV</CardTitle>
                {batches.length > 0 && (
                    <Button
                        size={"sm"}
                        variant={"outline"}
                        onClick={() => { setBatches([]); props.onClear?.(); }}
                        disabled={props.isProcessing}
                        isLoading={props.isProcessing}
                    >
                        Clear
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <label
                    htmlFor="csv-upload"
                    className="block cursor-pointer px-4 py-2 border border-dashed border-gray-400 rounded hover:bg-gray-50 transition-colors text-center"
                >
                    <span className="font-medium text-blue-600">Click to select a CSV file</span>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        key={batches.length} // reset input on clear
                        disabled={props.isProcessing}
                    />
                </label>
                <p className="text-sm text-gray-600">
                    Accepted file type: <code>.csv</code>
                </p>
                <p className="text-sm text-green-600">
                    {batches.length > 0 &&
                        `Uploaded ${batches.reduce((a, b) => a + b.length, 0)} rows in ${batches.length} batches.`}
                </p>

            </CardContent>
        </Card>
    );
};
