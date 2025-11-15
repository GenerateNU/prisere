"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FiUpload } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import DocumentTable from "./DocumentTable";
import { useMemo, useState } from "react";
import BusinessDocumentFilters from "./BusinessDocumentFilters";

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

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div className="flex flex-col gap-[10px]">
                    <h3 className="text-[24px]">Business Documents</h3>
                    <p className="text-[14px]"> Upload general business documents below. </p>
                </div>
                <div className="flex gap-[6px]">
                    <Button className="bg-[var(--fuchsia)] text-white text-[14px] h-[34px] w-fit">
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
        </Card>
    );
}
