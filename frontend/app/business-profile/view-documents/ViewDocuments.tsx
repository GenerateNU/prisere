"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FiUpload } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import DocumentTable from "./DocumentTable";
import { useMemo, useState } from "react";
import BusinessDocumentFilters from "./BusinessDocumentFilters";
import { confirmBusinessDocumentUpload, getAllDocuments, getBusinessDocumentUploadUrl, uploadToS3 } from "@/api/business-profile";

type SortOrder = "asc" | "desc";

export default function ViewDocuments() {
    const documents = [
        {
            title: "Business License",
            fileType: ".pdf",
            category: "Insurance",
            date: new Date("2023-01-15"),
        },
        {
            title: "Revenues Report Q1",
            fileType: ".pdf",
            category: "Revenues",
            date: new Date("2023-04-15"),
        },
        {
            title: "Expenses Report Q1",
            fileType: ".pdf",
            category: "Expenses",
            date: new Date("2023-04-15"),
        },
        {
            title: "Insurance Policy",
            fileType: ".pdf",
            category: "Insurance",
            date: new Date("2024-02-14"),
        },
        {
            title: "Business Document 1",
            fileType: ".pdf",
            category: "Insurance",
            date: new Date("2022-12-12"),
        },
        {
            title: "Report",
            fileType: ".pdf",
            category: "Revenues",
            date: new Date("2025-03-11"),
        },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [showFilters, setShowFilters] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>("");

    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    

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

    const handleUploadClick = () => {
        setIsModalOpen(true);
        setFile(null);
        setUploadProgress("");
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
        setUploadProgress("Getting upload URL...");

        try {
            const docResponse = await getAllDocuments();
            console.log("GOT ALL DOCUMENTS")
            console.log(docResponse);
            // Get presigned upload URL from backend
            const { uploadUrl, key, documentId } = await getBusinessDocumentUploadUrl(
                selectedFile.name,
                selectedFile.type
            );

            // Upload directly to S3
            setUploadProgress("Uploading to S3...");
            await uploadToS3(uploadUrl, selectedFile);

            // Confirm upload with backend (optional)
            setUploadProgress("Confirming upload...");
            await confirmBusinessDocumentUpload(key, documentId);

            setUploadProgress("Upload complete!");
            alert("File uploaded successfully!");
            setIsModalOpen(false);
            setFile(null);
            
            // ?? Refresh your documents list here
            
            
        } catch (error) {
            console.error("Error uploading file:", error);
            alert(`Failed to upload the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setUploadProgress("");
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
                    {/* <p className="text-sm">File Type: {selectedFile.type}</p> */}
                    {/* <p className="text-sm">
                        File Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p> */}
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

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[24px]">Business Documents</h3>
                    <p className="text-[14px]"> Upload general business documents below. </p>
                </div>
                <div className="flex gap-[6px]">
                    <Button className="bg-[var(--fuchsia)] text-white text-[14px] h-[34px] w-fit" onClick={handleUploadClick}>
                        <FiUpload className="test-white" /> Upload Document
                    </Button>
                    <Button
                        className="bg-[var(--slate)] text-black text-[14px] h-[34px] w-fit"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <IoFilterOutline className="test-black" />
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
                <DocumentTable
                    documents={filteredAndSortedDocuments}
                    onDownload={() => {}}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    dateSort={sortOrder}
                    setDateSort={setSortOrder}
                    initialPending={true}
                />
            </CardContent>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-[600px] max-w-[90%]">
                        <h2 className="text-lg font-bold mb-4">Upload Document</h2>
                        
                        <label 
                            htmlFor="file-upload" 
                            className="inline-block cursor-pointer bg-[var(--fuchsia)] text-white px-4 py-2 rounded-md shadow-md hover:bg-[var(--fuchsia-dark)] disabled:opacity-50"
                        >
                            Select File
                        </label>
                        <input 
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        
                        {fileData()}
                        
                        {uploadProgress && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                                {uploadProgress}
                            </div>
                        )}
                        
                        <div className="flex justify-center gap-4 mt-6">
                            <Button 
                                className="bg-gray-300 hover:bg-gray-400" 
                                onClick={() => setIsModalOpen(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-[var(--fuchsia)] text-white hover:bg-[var(--fuchsia-dark)] disabled:opacity-50" 
                                onClick={handleFileUpload}
                                disabled={!selectedFile || isUploading}
                            >
                                {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
