import { ErroredParsedRowResult, ParsedRowResult } from "../../types";

export const collectValidationErrors = (
    value: ParsedRowResult[],
    validateRow: (row: string[], rowIdx: number) => ParsedRowResult
) => {
    const allValidationAndParsingErrors: ErroredParsedRowResult[] = [];
    value.forEach((element) => {
        if ("error" in element) {
            allValidationAndParsingErrors.push(element);
            return;
        }

        const validationResult = validateRow(element.rawRowValues, element.rowNumber);

        if ("error" in validationResult) {
            allValidationAndParsingErrors.push(validationResult);
            return;
        }
    });

    return allValidationAndParsingErrors;
};
