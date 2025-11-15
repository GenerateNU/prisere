"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FiUpload } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import DocumentTable from "./DocumentTable";

export default function ViewDocuments() {
    return (
        <Card>
            <CardHeader>
                <p>Business Documents</p>
                <Button>
                    <FiUpload /> Upload Document
                </Button>
                <Button>
                    <IoFilterOutline />Filters
                </Button>
            </CardHeader>
            <CardDescription>
                Upload general business documents below.
            </CardDescription>
            <CardContent>
                <div></div>
                <DocumentTable />
            </CardContent>
        </Card>
    );
}