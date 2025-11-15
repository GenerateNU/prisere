import { optionalColumnsArray, ParsedRowResult, requiredColumnsArray } from "../../types";

export const buildValidateRowValues = (columnOrdering: string[]) => {
    if (
        columnOrdering.some(
            (fieldName) => !requiredColumnsArray.includes(fieldName) && !optionalColumnsArray.includes(fieldName)
        )
    ) {
        throw new Error(
            "The given column ordering may only be field names from the following list: " +
                [...requiredColumnsArray, ...optionalColumnsArray]
        );
    }

    const getValidationErrors = (elements: string[]): string[] => {
        if (elements.length !== columnOrdering.length) {
            return ["The selected columns must match the number of columns in the given file."];
        }

        return elements
            .map((element, idx) => validateField(columnOrdering[idx], element))
            .filter((element) => element !== undefined);
    };

    return (row: string[], rowIdx: number): ParsedRowResult => {
        const errs = getValidationErrors(row);
        if (errs.length === 0) {
            return {
                rawRowValues: row,
                rowNumber: rowIdx,
            };
        } else {
            return {
                rawRowValues: row,
                error: errs.join(", "),
                rowNumber: rowIdx,
            };
        }
    };
};

const validateField = (fieldName: string, value: string): string | undefined => {
    switch (fieldName.toLowerCase()) {
        case "amountcents":
            return isNaN(parseFloat(value))
                ? "The given amount must be a number without any leading or falling characters."
                : undefined;
        case "description":
            return value.length > 400 ? "The given description must be less than 400 characters" : undefined;
        case "category":
            return value.length > 100 ? "The given category must be less than 100 characters" : undefined;
        default:
            throw new Error(`Illegal State: The given field name ${fieldName} is not a supported column`);
    }
};
