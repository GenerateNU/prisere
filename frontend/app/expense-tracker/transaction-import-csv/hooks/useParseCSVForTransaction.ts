"use client";
import { useCallback, useState } from "react";
import { ErroredParsedRowResult } from "../types";
import { buildValidateRowValues } from "./helpers/validateRowValues";
import { useReadCSV } from "./useReadCSV";
import { createInvoice } from "@/api/invoice";
import { createPurchaseForCompany } from "@/api/purchase";
import { parseAndSaveTransaction } from "./helpers/parseAndSaveTransaction";
import { collectValidationErrors } from "./helpers/collectValidationErrors";
import { useColumnOrderSelection } from "./useColumnOrderSelection";

export const useParseCSVForTransaction = () => {
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [hasHeaders, setHasHeaders] = useState<boolean>(false);
    const { setFieldPosition, columnOrder } = useColumnOrderSelection(["amountcents", "description", "category"]);
    const [transactionType, setTransactionType] = useState<"invoice" | "purchase">("purchase");
    const [importStage, setImportStage] = useState<"Mounted" | "Validating" | "Importing" | "Complete!">("Mounted");
    const [validationErrors, setValidationErrors] = useState<ErroredParsedRowResult[]>([]);
    const [importErrors, setImportErrors] = useState<ErroredParsedRowResult[]>([]);
    const validateRow = useCallback((() => buildValidateRowValues(columnOrder))(), [columnOrder]);
    const hasParsingError = () => validationErrors.length > 0 || importErrors.length > 0;

    // Validation completes before import begins - ensures data integrity before API calls
    const onValidationComplete = (file: File, errors: ErroredParsedRowResult[]) => {
        if (errors.length > 0 || hasValidationErrored) {
            console.error("Validation failed with errors:", errors);
            setImportStage("Mounted");
            return;
        }

        handleImportFile(file);
    };

    const {
        parseFile: fileValidationParser,
        currentLineCount,
        isReadingCSV: isValidating,
        hasErrored: hasValidationErrored,
    } = useReadCSV(hasParsingError, onValidationComplete, async (value) => {
        const validationErrors = collectValidationErrors(value, validateRow);

        setValidationErrors((prevErrors) => [...prevErrors, ...validationErrors]);
        return validationErrors;
    });

    const onImportComplete = () => {
        setImportStage("Complete!");
    };

    const { parseFile: parseAndSaveFile, isReadingCSV: isSavingFile } = useReadCSV(
        hasParsingError,
        onImportComplete,
        async (values, parentTransactionId) => {
            const importErrors = await parseAndSaveTransaction(
                values,
                parentTransactionId,
                transactionType,
                columnOrder
            );

            if (importErrors && importErrors.length > 0) {
                setImportErrors((prevErrors) => [...prevErrors, ...importErrors]);
            }

            return importErrors || [];
        }
    );

    const setSelectedFileWrapper = async (newFile: File | null | undefined) => {
        if (!newFile) return;

        // Prevent concurrent operations that could corrupt state
        if (isValidating || isSavingFile) {
            console.warn("Cannot select a new file while validation or import is in progress");
            return;
        }

        // Clear error state from previous file imports
        setValidationErrors([]);
        setImportErrors([]);

        setSelectedFile(newFile);

        // Automatically trigger validation on file selection
        setImportStage("Validating");
        fileValidationParser(newFile, "", hasHeaders);
    };

    const handleImportFile = async (file: File) => {
        // Safety check - validation should have already passed before reaching here
        if (validationErrors.length > 0) {
            console.error("Cannot import - validation failed:", {
                errorsCount: validationErrors.length,
            });
            setImportStage("Mounted");
            return;
        }

        setImportStage("Importing");
        let parentTransactionId;

        try {
            // Create parent transaction first - all CSV rows will be line items under this transaction
            if (transactionType === "purchase") {
                const purchaseResult = await createPurchaseForCompany({
                    items: [
                        {
                            isRefund: false,
                            totalAmountCents: 0,
                        },
                    ],
                });
                parentTransactionId = purchaseResult[0]?.id || null;
            } else if (transactionType === "invoice") {
                const purchaseResult = await createInvoice({
                    items: [
                        {
                            totalAmountCents: 0,
                        },
                    ],
                });
                parentTransactionId = purchaseResult[0]?.id || null;
            }

            if (!parentTransactionId) {
                throw new Error(`Unable to create a transaction of type ${transactionType}`);
            }

            if (!file) {
                throw new Error(`The selected file is not available, ${file}`);
            }

            // Parse CSV and create line items associated with the parent transaction
            parseAndSaveFile(file, parentTransactionId, hasHeaders);
        } catch (error) {
            console.error("Import failed:", error);
            setImportStage("Mounted");
            throw error;
        }
    };

    return {
        selectedFile,
        setSelectedFile: setSelectedFileWrapper,
        hasHeaders,
        setHasHeaders,
        columnOrder,
        setColumnPosition: setFieldPosition,
        transactionType,
        setTransactionType,
        importStage,
        currentLineCount,
        isValidating,
        isSavingFile,
        hasParsingError,
        validationErrors,
        importErrors,
    };
};
