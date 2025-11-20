import Papa from "papaparse";
import { useCallback } from "react";
import { ErroredParsedRowResult, ParsedRowResult } from "../types";

export const useReadCSV = (
    shouldStopParsing: () => boolean,
    onParseComplete: (fileRead: File, errors: ErroredParsedRowResult[]) => void,
    broadcastRows: (rowResults: ParsedRowResult[], parentTransactionId: string) => Promise<ErroredParsedRowResult[]>
) => {
    let isReadingCSV = false;
    let currLineNum: number = 1;
    let isErrored: boolean = false;

    const parseFile = useCallback(
        (file: File, parentTransactionId: string, hasHeaders: boolean = false) => {
            if (!file) return;

            isReadingCSV = true;
            let currentBatchedLines: ParsedRowResult[] = [];
            const accumulatedErrors: ErroredParsedRowResult[] = [];

            Papa.parse(file, {
                header: hasHeaders,
                complete: async () => {
                    // Process final batch if it doesn't reach the 250-row threshold
                    if (currentBatchedLines.length > 0) {
                        const errors = await broadcastRows(currentBatchedLines, parentTransactionId);
                        accumulatedErrors.push(...errors);
                    }

                    isReadingCSV = false;
                    onParseComplete(file, accumulatedErrors);
                },
                step: async (currLine, parser) => {
                    currentBatchedLines.push({ rawRowValues: currLine.data as string[], rowNumber: currLineNum });
                    currLineNum++;

                    // Process in batches of 250 to avoid memory issues and provide incremental progress
                    if (currentBatchedLines.length >= 250) {
                        parser.pause();

                        const errors = await broadcastRows(currentBatchedLines, parentTransactionId);
                        currentBatchedLines = [];

                        // Fail-fast: abort entire import if any batch has errors
                        if (errors.length > 0) {
                            accumulatedErrors.push(...errors);
                            parser.abort();
                            isReadingCSV = false;
                            isErrored = true;
                            return;
                        }

                        parser.resume();
                    }
                },
                error: (err) => {
                    currentBatchedLines.push({
                        error: err.message,
                        rowNumber: currLineNum,
                    });
                    currLineNum++;
                },
            });
        },
        [shouldStopParsing, onParseComplete, broadcastRows]
    );

    return {
        currentLineCount: currLineNum,
        isReadingCSV,
        hasErrored: isErrored,
        parseFile,
    };
};
