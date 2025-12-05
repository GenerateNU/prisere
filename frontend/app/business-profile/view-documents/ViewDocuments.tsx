"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FiUpload } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import DocumentTable from "./DocumentTable";
import { useEffect, useMemo, useState } from "react";
import BusinessDocumentFilters from "./BusinessDocumentFilters";
import {
    confirmBusinessDocumentUpload,
    deleteBusinessDocument,
    getAllDocuments,
    getBusinessDocumentUploadUrl,
    updateDocumentCategory,
    uploadToS3,
} from "@/api/business-profile";
import { BusinessDocument, DocumentCategories } from "@/types/documents";
import Loading from "@/components/loading";
import ErrorDisplay from "@/components/ErrorDisplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SortOrder = "asc" | "desc";

export default function ViewDocuments() {
    // Replace hardcoded documents with state
    const [documents, setDocuments] = useState<BusinessDocument[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
    const [error, setError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [showFilters, setShowFilters] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [uploadCategory, setUploadCategory] = useState<DocumentCategories | "">("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Load documents on component mount
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoadingDocuments(true);

            const docs = await getAllDocuments();

            // Transform the response into the BusinessDocument type
            const transformedDocs: BusinessDocument[] = docs!.map((doc) => {
                // Access the nested document object
                const { document, downloadUrl } = doc;

                // Extract the filename and extension from the key
                const filename = document.key.split("/").pop() || document.id;
                const extension = "." + (document.key.split(".").pop() || "pdf");

                let date = new Date();
                if (document.lastModified && typeof document.lastModified === "string") {
                    date = new Date(document.lastModified);
                } else if (document.createdAt && typeof document.createdAt === "string") {
                    date = new Date(document.createdAt);
                }

                return {
                    title: filename.replace(extension, ""),
                    fileType: extension,
                    category: (document.category as DocumentCategories | null) ?? "",
                    date: date,
                    key: document.key,
                    url: downloadUrl,
                    documentId: document.id,
                };
            });

            // Update the state with the transformed documents
            setDocuments(transformedDocs);
        } catch (_error) {
            setError(true);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    const filteredAndSortedDocuments = useMemo(() => {
        let results = documents;

        if (searchQuery !== "") {
            results = results.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (categoryFilter !== "All Categories") {
            results = results.filter((doc) => doc.category === categoryFilter);
        }

        if (dateFilter !== "All Dates") {
            const now = new Date();
            results = results.filter((doc) => {
                const docDate = new Date(doc.date);
                switch (dateFilter) {
                    case "Today":
                        return docDate.toDateString() === now.toDateString();
                    case "This Week": {
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        return docDate >= weekStart && docDate <= weekEnd;
                    }
                    case "This Month":
                        return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                    case "This Year":
                        return docDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }

        const sorted = [...results].sort((a, b) => {
            const aValue = a["date"];
            const bValue = b["date"];

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return sorted;
    }, [documents, searchQuery, categoryFilter, dateFilter, sortOrder]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, dateFilter, sortOrder]);

    const handleUploadClick = () => {
        setIsModalOpen(true);
        setFile(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        setIsUploading(true);

        try {
            //Get presigned upload URL from backend
            const { uploadUrl, key, documentId } = await getBusinessDocumentUploadUrl(
                selectedFile.name,
                selectedFile.type
            );

            // Upload directly to S3
            await uploadToS3(uploadUrl, selectedFile);

            // Confirm upload with backend
            await confirmBusinessDocumentUpload(key, documentId, uploadCategory || undefined);
            setIsModalOpen(false);
            setFile(null);
            setUploadCategory("");

            // Refresh documents list to show the newly uploaded file
            await loadDocuments();
        } catch (error) {
            console.error("Error uploading file:", error);
            alert(`Failed to upload the file: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsUploading(false);
        }
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        document: BusinessDocument | null;
    }>({
        isOpen: false,
        document: null,
    });

    // Add delete handler
    const handleDeleteClick = (doc: BusinessDocument) => {
        setDeleteConfirmation({
            isOpen: true,
            document: doc,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation.document) return;

        try {
            await deleteBusinessDocument(deleteConfirmation.document.key, deleteConfirmation.document.documentId);

            // Remove from local state
            setDocuments((prevDocs) =>
                prevDocs.filter((doc) => doc.documentId !== deleteConfirmation.document?.documentId)
            );

            // Close confirmation dialog
            setDeleteConfirmation({ isOpen: false, document: null });
        } catch (error) {
            console.error("Error deleting document:", error);
            alert(`Failed to delete document: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, document: null });
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="flex justify-between">
                <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[24px] font-bold">Business Documents</h3>
                    <p className="text-[14px]">Upload general business documents below.</p>
                </div>
                <div className="flex gap-[6px]">
                    <Button
                        className="bg-[var(--fuchsia)] text-white text-[14px] h-[34px] w-fit"
                        onClick={handleUploadClick}
                        disabled={isLoadingDocuments}
                    >
                        <FiUpload className="text-white mr-1" /> Upload Document
                    </Button>
                    <Button
                        className="bg-[var(--slate)] text-black text-[14px] h-[34px] w-fit"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <IoFilterOutline className="text-black mr-1" />
                        Filters
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {showFilters && (
                    <div className="mb-[16px]">
                        <BusinessDocumentFilters
                            dateFilter={dateFilter}
                            setDateFilter={setDateFilter}
                            categoryFilter={categoryFilter}
                            setCategoryFilter={setCategoryFilter}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    </div>
                )}

                {/* Show loading state or documents */}
                {isLoadingDocuments ? (
                    <div className="py-8 flex items-center justify-center w-full">
                        <Loading lines={2} />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No documents found. Upload your first document to get started!
                    </div>
                ) : error ? (
                    <div className="py-8 flex items-center justify-center w-full">
                        <ErrorDisplay />
                    </div>
                ) : (
                    <>
                        <DocumentTable
                            documents={paginatedDocuments}
                            onCategoryChange={async (documentId, newCategory) => {
                                try {
                                    // Update in backend first then local
                                    await updateDocumentCategory(documentId, newCategory as DocumentCategories);

                                    setDocuments((prevDocs) =>
                                        prevDocs.map((doc) =>
                                            doc.documentId === documentId
                                                ? { ...doc, category: newCategory as DocumentCategories }
                                                : doc
                                        )
                                    );
                                } catch (error) {
                                    console.error("Error updating category:", error);
                                    alert(
                                        `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}`
                                    );
                                }
                            }}
                            onDownload={(url) => {
                                window.open(url, "_blank");
                            }}
                            onDelete={handleDeleteClick}
                            onEdit={() => {
                                // TODO: Implement edit functionality
                                alert("Edit functionality coming soon!");
                            }}
                            dateSort={sortOrder}
                            setDateSort={setSortOrder}
                            initialPending={false}
                        />

                        {/* Pagination Controls */}
                        {filteredAndSortedDocuments.length > 0 && (
                            <div className="flex items-center justify-end mt-4 px-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Rows per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border-none bg-transparent text-sm text-gray-700 focus:outline-none cursor-pointer"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <span className="text-sm text-gray-600">
                                    {startIndex + 1}-{Math.min(endIndex, filteredAndSortedDocuments.length)} of{" "}
                                    {filteredAndSortedDocuments.length}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                                    </button>

                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-w-[90%] relative">
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={isUploading}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        >
                            ×
                        </button>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-center mb-2">Upload a File</h2>

                        {/* Subtitle */}
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Upload a PDF file to store in the Business Documents table
                        </p>

                        {/* Drag and drop area */}
                        <div
                            onClick={() => !isUploading && document.getElementById("file-upload")?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isUploading && e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setFile(e.dataTransfer.files[0]);
                                }
                            }}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            {/* Upload icon - replace with your own */}
                            <div className="flex justify-center mb-4">
                                <svg
                                    width="55"
                                    height="55"
                                    viewBox="0 0 55 55"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M25.1875 40.9859V7.46712L16.1588 16.4959L13.4152 13.7136L27.125 0L40.8386 13.7136L38.0951 16.4998L29.0625 7.46712V40.9859H25.1875ZM6.262 54.25C4.47692 54.25 2.98762 53.6533 1.79412 52.4598C0.600624 51.2663 0.00258333 49.7757 0 47.988V38.5989H3.875V47.988C3.875 48.5848 4.123 49.1324 4.619 49.631C5.115 50.1296 5.66137 50.3776 6.25812 50.375H47.9919C48.586 50.375 49.1324 50.127 49.631 49.631C50.1296 49.135 50.3776 48.5873 50.375 47.988V38.5989H54.25V47.988C54.25 49.7731 53.6533 51.2624 52.4598 52.4559C51.2663 53.6494 49.7757 54.2474 47.988 54.25H6.262Z"
                                        fill="#2E2F2D"
                                    />
                                </svg>
                            </div>

                            <p className="text-gray-600">Drop a file or click to browse</p>

                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                        </div>

                        {/* File details (shown after file is selected) */}
                        {selectedFile && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        disabled={isUploading}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-fit h-[40px] px-6"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[var(--fuchsia)] text-white hover:bg-[var(--pink)] disabled:opacity-50 w-fit h-[40px] px-6"
                                onClick={handleFileUpload}
                                disabled={!selectedFile || isUploading}
                            >
                                {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]">
                        <h2 className="text-xl font-semibold mb-4">Delete Document</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete &quot;{deleteConfirmation.document?.title}&quot;? This
                            action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-fit h-[40px] px-6"
                                onClick={handleCancelDelete}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-fuchsia text-white hover:bg-pink w-fit h-[40px] px-6"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
