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
    uploadToS3 
} from "@/api/business-profile";

type SortOrder = "asc" | "desc";

interface DocumentWithCategory {
    title: string;
    fileType: string;
    category: string;
    date: Date;
    key: string;
    url: string;
    size: number;
    documentId: string;
}

export default function ViewDocuments() {
    // Replace hardcoded documents with state
    const [documents, setDocuments] = useState<DocumentWithCategory[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [showFilters, setShowFilters] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Load documents on component mount
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoadingDocuments(true);
            const docs = await getAllDocuments();
            
            const transformedDocs: DocumentWithCategory[] = docs.map(doc => {
                // Extract filename from key (last part after /)
                const filename = doc.key.split('/').pop() || doc.documentId;
                const extension = '.' + (doc.key.split('.').pop() || 'pdf');
                
                return {
                    title: filename.replace(extension, ''), // Remove extension for title
                    fileType: extension,
                    category: selectedCategory,
                    date: doc.lastModified ? new Date(doc.lastModified) : new Date(),
                    key: doc.key,
                    url: doc.url,
                    size: doc.size,
                    documentId: doc.documentId,
                };
            });
            
            setDocuments(transformedDocs);
        } catch (error) {
            console.error("Error loading documents:", error);
            alert("Failed to load documents. Please try again.");
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    const filteredAndSortedDocuments = useMemo(() => {
        let results = documents;

        if (searchQuery !== "") {
            results = results.filter((doc) => 
                doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
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
                        return docDate.getMonth() === now.getMonth() && 
                               docDate.getFullYear() === now.getFullYear();
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
            await confirmBusinessDocumentUpload(key, documentId);
            setIsModalOpen(false);
            setFile(null);
            
            // Refresh documents list to show the newly uploaded file
            await loadDocuments();
            
        } catch (error) {
            console.error("Error uploading file:", error);
            alert(`Failed to upload the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const fileData = () => {
        if (selectedFile) {
            return (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h2 className="font-semibold mb-2">File Details:</h2>
                    <p className="text-sm">File Name: {selectedFile.name}</p>
                    <p className="text-sm">
                        File Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
            );
        } else {
            return (
                <div className="mt-4 text-center text-gray-500">
                    <p>Choose a file before pressing the Upload button</p>
                </div>
            );
        }
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        document: DocumentWithCategory | null;
    }>({
        isOpen: false,
        document: null,
    });

    // Add delete handler
    const handleDeleteClick = (doc: DocumentWithCategory) => {
        setDeleteConfirmation({
            isOpen: true,
            document: doc,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation.document) return;

        try {
            await deleteBusinessDocument(
                deleteConfirmation.document.key,
                deleteConfirmation.document.documentId
            );
            
            // Remove from local state
            setDocuments(prevDocs =>
                prevDocs.filter(doc => doc.documentId !== deleteConfirmation.document!.documentId)
            );
            
            // Close confirmation dialog
            setDeleteConfirmation({ isOpen: false, document: null });
        } catch (error) {
            console.error("Error deleting document:", error);
            alert(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, document: null });
    };

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[24px]">Business Documents</h3>
                    <p className="text-[14px]">
                        Upload general business documents below.
                        {isLoadingDocuments && " Loading documents..."}
                    </p>
                </div>
                <div className="flex gap-[6px]">
                    <Button 
                        className="bg-[var(--fuchsia)] text-white text-[14px] h-[34px] w-fit" 
                        onClick={handleUploadClick}
                        disabled={isLoadingDocuments}
                    > 
                        <FiUpload className="text-white mr-2" /> Upload Document
                    </Button>
                    <Button
                        className="bg-[var(--slate)] text-black text-[14px] h-[34px] w-fit"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <IoFilterOutline className="text-black mr-2" />
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
                    <div className="text-center py-8 text-gray-500">
                        Loading documents...
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No documents found. Upload your first document to get started!
                    </div>
                ) : (
                    <DocumentTable
                        documents={filteredAndSortedDocuments}
                        onCategoryChange={(documentId, newCategory) => {
                            // Update the document's category
                            setDocuments(prevDocs =>
                                prevDocs.map(doc =>
                                    doc.documentId === documentId
                                        ? { ...doc, category: newCategory }
                                        : doc
                                )
                            );
                            // TODO: Call API to persist the change
                        }}
                        onDownload={(doc) => {
                            // Open the presigned URL in a new tab - 
                            // TO DO - have a popup to display the PDF in the same screen
                            // TO DO- get the URL
                            window.open(doc, '_blank');
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
                        <h2 className="text-xl font-semibold text-center mb-2">
                            Upload a File
                        </h2>
                        
                        {/* Subtitle */}
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Upload a PDF file to store in the Business Documents table
                        </p>

                        {/* Drag and drop area */}
                        <div
                            onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
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
                                <svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25.1875 40.9859V7.46712L16.1588 16.4959L13.4152 13.7136L27.125 0L40.8386 13.7136L38.0951 16.4998L29.0625 7.46712V40.9859H25.1875ZM6.262 54.25C4.47692 54.25 2.98762 53.6533 1.79412 52.4598C0.600624 51.2663 0.00258333 49.7757 0 47.988V38.5989H3.875V47.988C3.875 48.5848 4.123 49.1324 4.619 49.631C5.115 50.1296 5.66137 50.3776 6.25812 50.375H47.9919C48.586 50.375 49.1324 50.127 49.631 49.631C50.1296 49.135 50.3776 48.5873 50.375 47.988V38.5989H54.25V47.988C54.25 49.7731 53.6533 51.2624 52.4598 52.4559C51.2663 53.6494 49.7757 54.2474 47.988 54.25H6.262Z" fill="#2E2F2D"/>
                                </svg>
                            </div>
                            
                            <p className="text-gray-600">
                                Drop a file or click to browse
                            </p>
                            
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
                            Are you sure you want to delete "{deleteConfirmation.document?.title}"? 
                            This action cannot be undone.
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