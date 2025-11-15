"use client";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useParseCSVForTransaction } from "./hooks/useParseCSVForTransaction";

interface TransactionImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TransactionImportModal({ isOpen, onClose }: TransactionImportModalProps) {
    const {
        // columnOrder,
        // currentLineCount,
        hasHeaders,
        // hasParsingError,
        importErrors,
        importStage,
        // isSavingFile,
        // isValidating,
        // selectedFile,
        // setColumnPosition,
        setHasHeaders,
        setSelectedFile,
        // setTransactionType,
        // transactionType,
        validationErrors,
    } = useParseCSVForTransaction();
    return (
        isOpen && (
            <>
                <div className="fixed top-0 left-0 w-full h-full bg-black opacity-25 z-50" onClick={onClose}></div>
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 pointer-events-none">
                    <div className="relative bg-white rounded-xl p-9 pointer-events-auto">
                        <div className="flex w-full justify-between">
                            <h1>Import Transactions</h1>
                            <XIcon onClick={onClose} size={"20px"} />
                        </div>
                        <Button variant="ghost" onClick={() => setHasHeaders(!hasHeaders)}>
                            Has Headers: {String(hasHeaders)}
                        </Button>
                        <input
                            type="file"
                            onChange={(newFile) => {
                                if (!newFile) return;
                                setSelectedFile(newFile.target.files?.item(0) || undefined);
                            }}
                        />
                        <p>{importStage}</p>
                        <p>
                            {validationErrors
                                .slice(0, 20)
                                .map((element) => JSON.stringify(element))
                                .join(", ")}
                        </p>
                        <p>
                            {importErrors
                                .slice(0, 20)
                                .map((element) => JSON.stringify(element))
                                .join(", ")}
                        </p>
                    </div>
                </div>
            </>
        )
    );
}
