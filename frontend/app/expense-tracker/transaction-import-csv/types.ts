export type ParsedRowResult = SuccessfulParseRowResult | ErroredParsedRowResult;

export type SuccessfulParseRowResult = {
    rawRowValues: string[];
    rowNumber: number;
};

export interface ErroredParsedRowResult {
    error: string;
    rowNumber: number;
}

export const requiredColumnsArray = ["amountcents"] as readonly string[];
export const optionalColumnsArray = ["description", "category"] as readonly string[];
export type RequiredColumnNamesType = (typeof requiredColumnsArray)[number];
export type OptionalColumnNamesType = (typeof optionalColumnsArray)[number];
