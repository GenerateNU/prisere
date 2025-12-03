import { FilteredPurchases, PurchaseWithLineItems } from "@/types/purchase";
import Papa from 'papaparse';
import { DISASTER_TYPE_LABELS } from "@/types/disaster";
import { getAllPurchasesForExport } from "@/api/purchase";

const handleCSVCreation = (purchases: PurchaseWithLineItems[]) => {
    const data = purchases.flatMap(p => {
        if (p.lineItems.length === 0) {
            return [{
                Merchant: p.vendor || "Unknown Vendor",
                "Purchase Amount": (p.totalAmountCents / 100).toFixed(2),
                "Purchase Date": new Date(p.dateCreated).toLocaleDateString(),
                "Line Item": "No line items",
                "Line Item Amount": "0.00",
                Category: "N/A",
                "Disaster Related": "Non-Disaster"
            }];
        }

        return p.lineItems.map(li => ({
            Merchant: p.vendor || "Unknown Vendor",
            "Purchase Amount": (p.totalAmountCents / 100).toFixed(2),
            "Purchase Date": new Date(p.dateCreated).toLocaleDateString(),
            "Line Item": li.description || "Unknown Item",
            "Line Item Amount": (li.amountCents / 100).toFixed(2),
            Category: li.category || "Undefined",
            "Disaster Related": DISASTER_TYPE_LABELS.get(li.type || "pending") ?? "Undefined"
        }));
    });

    const csv = Papa.unparse(data);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `business-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
};

const handleExportClick =
    async (setIsExporting: (bool: boolean) => void, filters: FilteredPurchases, total: number) => {
    setIsExporting(true);
    const allPurchases = await getAllPurchasesForExport(filters, total);
    handleCSVCreation(allPurchases);
    setIsExporting(false);
};