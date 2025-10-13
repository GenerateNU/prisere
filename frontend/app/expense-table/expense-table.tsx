"use client";

import { getAllInvoicesForCompany } from "@/api/invoice";
import { getAllPurchasesForCompany } from "@/api/purchase";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Invoice } from "@/types/invoice";
import { Purchase } from "@/types/purchase";
import { useQuery } from "@tanstack/react-query";

type InvoiceOrPurchase = Invoice | Purchase;

export default function ExpenseTable({ companyId } : { companyId : string }) {
    const purchases = useQuery({
        queryKey: ["purchases-for-company", companyId],
        queryFn: () => getAllPurchasesForCompany(companyId),
    });

    const invoices = useQuery({
        queryKey: ["invoices-for-company", companyId],
        queryFn: () => getAllInvoicesForCompany(companyId),
    });

    if (purchases.isPending || invoices.isPending) return <div>Loading expenses and invoices...</div>;

    if (purchases.error || invoices.error) return <div>Error loading expenses and invoices</div>;

    return (
        <BasicTable purchases={purchases.data} invoices={invoices.data}  />
    );
}

function BasicTable({ purchases, invoices, }: { purchases: Purchase[]; invoices: Invoice[]; }) {
    return (
        <Table>
            <TableCaption>A list of your recent cash-flows.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Disaster?</TableHead>
                </TableRow>
            </TableHeader>
            {purchases.map((purchase) => (
                <TableRow>
                    <TableCell>Purchase</TableCell>
                    <TableCell>${(purchase.totalAmountCents / 100).toFixed(2)}</TableCell>
                    <TableCell>{new Date(purchase.dateCreated).toLocaleDateString()}</TableCell>
                    <TableCell>WIP</TableCell>
                    <TableHead>WIP</TableHead>
                </TableRow>
            ))}
            {invoices.map((invoice) => (
                <TableRow>
                    <TableCell>Invoice</TableCell>
                    <TableCell>${(invoice.totalAmountCents / 100).toFixed(2)}</TableCell>
                    <TableCell>{new Date(invoice.dateCreated).toLocaleDateString()}</TableCell>
                    <TableCell>WIP</TableCell>
                    <TableHead>WIP</TableHead>
                </TableRow>
            ))}
        </Table>
    );
}

