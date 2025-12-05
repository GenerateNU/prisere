import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";

interface UploadDocumentProps {
    selectedFiles: File[];
    handleUploadFiles: (files: File[]) => void;
}

export const UploadDocument = ({ handleUploadFiles, selectedFiles }: UploadDocumentProps) => {
    const [stagedFiles, setStagedFiles] = useState<File[]>(selectedFiles);
    const [error, setError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];

    const isFileTypeAllowed = (file: File) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        return allowedTypes.includes(extension);
    };

    const validateAndAddFiles = (files: File[]) => {
        setError("");

        // Check for duplicates within the new batch
        const newFileNames = files.map((f) => f.name);
        const hasDuplicatesInBatch = newFileNames.length !== new Set(newFileNames).size;

        if (hasDuplicatesInBatch) {
            setError("Cannot upload files with duplicate names in the same batch.");
            return;
        }

        // Check for duplicates with existing staged files
        const existingFileNames = stagedFiles.map((f) => f.name);
        const hasDuplicatesWithStaged = files.some((file) => existingFileNames.includes(file.name));

        if (hasDuplicatesWithStaged) {
            setError("Some files already exist in the staged list.");
            return;
        }

        // Check if all files are allowed types
        const invalidFiles = files.filter((file) => !isFileTypeAllowed(file));
        if (invalidFiles.length > 0) {
            setError(`Invalid file type(s). Only ${allowedTypes.join(", ")} are allowed.`);
            return;
        }

        setStagedFiles((prev) => [...prev, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            validateAndAddFiles(filesArray);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            validateAndAddFiles(filesArray);
        }
    };

    const removeFile = (fileToRemove: File) => {
        setStagedFiles((prev) => prev.filter((file) => file.name !== fileToRemove.name));
        setError("");
    };

    return (
        <div className="flex gap-4 flex-col max-h-3/4">
            <div className="w-full flex flex-col justify-start items-center text-zinc-800 text-2xl font-bold">
                Upload a File
                <div className="self-stretch flex flex-col justify-start items-center gap-2 text-lg font-normal">
                    Upload a document to include in your claim report
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={allowedTypes.join(",")}
                onChange={handleFileSelect}
                className="hidden"
            />

            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`h-60 p-6 rounded-2xl outline-1 outline-dashed flex flex-col justify-center items-center gap-7 cursor-pointer transition-colors ${
                    isDragging ? "outline-teal bg-light-teal" : "outline-zinc-800 hover:bg-zinc-50"
                }`}
            >
                <Upload size={40} className={isDragging ? "text-teal" : ""} />
                <div className="flex flex-col justify-end items-center gap-2.5 text-center">
                    <div className="text-xl">Drop a file or click to browse</div>
                    <div className="text-sm">pdf, jpg, jpeg, png</div>
                </div>
            </div>

            {error && <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

            {stagedFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold text-zinc-700">Staged Files ({stagedFiles.length})</div>
                    {stagedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-800">{file.name}</span>
                                <span className="text-xs text-zinc-500">{(file.size / 1024).toFixed(2)} KB</span>
                            </div>
                            <button
                                onClick={() => removeFile(file)}
                                className="p-1 hover:bg-zinc-200 rounded transition-colors"
                                aria-label={`Remove ${file.name}`}
                            >
                                <X size={18} className="text-zinc-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center p-4">
                <Button
                    variant={"outline"}
                    onClick={async () => {
                        handleUploadFiles(stagedFiles);
                    }}
                    className={`py-2 px-6 rounded-full bg-[var(--fuchsia)] text-white w-fit h-fit`}
                >
                    Save Selection
                </Button>
            </div>
        </div>
    );
};
