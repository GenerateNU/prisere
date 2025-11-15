"use client";
import { useState } from "react";
import ExpenseTable from "./expense-table/expense-table";
import TransactionImportModal from "./transaction-import-csv/TransactionImportModal";
import { Button } from "@/components/ui/button";

export default function ExpenseTracker() {
    const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
    const onOpenImportModal = () => setImportModalOpen(true);
    const onCloseImportModal = () => setImportModalOpen(false);
    return (
        <>
            <Button onClick={onOpenImportModal}>Import Transactions</Button>
            <TransactionImportModal isOpen={importModalOpen} onClose={onCloseImportModal} />
            <ExpenseTable title={"Business Transactions"} rowOption={"collapsible"} editableTags={true} />
        </>
    );
}
