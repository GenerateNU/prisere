"use client";
import { useEffect, useState } from "react";
import ExpenseTable, { useFetchPurchases } from "./expense-table/expense-table";
import TransactionImportModal from "./transaction-import-csv/TransactionImportModal";
import { Button } from "@/components/ui/button";
import RevenueAndExpenses, { RevenueAndExpensesNoData } from "@/components/dashboard/RevenueAndExpenses";
import NetDisasterExpense, { NetDisasterExpenseNoData } from "@/components/dashboard/NetDisasterExpenses";
import { getDashboardBannerData } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import ReviewExpenses from "./ReviewExpenses";
import { PurchaseLineItemType } from "@/types/purchase";
import { companyHasData, getCompany } from "@/api/company";
import { GoSync } from "react-icons/go";
import { FiUpload } from "react-icons/fi";
import NoDataPopupWrapper from "@/components/dashboard/NoDataPopupWrapper";

export default function ExpenseTracker() {
    const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
    const [filterPending, setFilterPending] = useState<boolean>(false);
    const onOpenImportModal = () => setImportModalOpen(true);
    const onCloseImportModal = () => setImportModalOpen(false);

    const { data: hasData, isPending: hasDataLoading } = useQuery({
        queryKey: ["company-has-data"],
        queryFn: companyHasData,
    });

    useEffect(() => {
        console.log("external data", hasData?.hasExternalData);
        console.log("financial data", hasData?.hasFinancialData);
    })

    const { data: companyLastUpdate } = useQuery({
        queryKey: ["company-last-update"],
        queryFn: getCompany,
    });

    const { data: bannerData } = useQuery({
        queryKey: ["banner-data"],
        queryFn: getDashboardBannerData,
    });

    const lastInvoice = companyLastUpdate?.lastQuickBooksInvoiceImportTime;
    const lastPurchase = companyLastUpdate?.lastQuickBooksPurchaseImportTime;

    const mostRecent = lastInvoice && lastPurchase
        ? new Date(Math.max(new Date(lastInvoice).getTime(), new Date(lastPurchase).getTime()))
        : undefined;

    const exExpenses = useFetchPurchases({
        pageNumber: 0,
        resultsPerPage: 100,
        type: PurchaseLineItemType.EXTRANEOUS,
    });
    const typicalExpenses = useFetchPurchases({
        pageNumber: 0,
        resultsPerPage: 100,
        type: PurchaseLineItemType.TYPICAL,
    });
    const exExpensesLineItems =
        exExpenses.data?.purchases
            ?.flatMap((purchase) => purchase.lineItems)
            .filter((lineItem) => {
                return lineItem.type === "extraneous";
            }) ?? [];
    const typicalExpensesLineItems =
        typicalExpenses.data?.purchases
            ?.flatMap((purchase) => purchase.lineItems)
            .filter((lineItem) => {
                return lineItem.type === "typical";
            }) ?? [];

    const lineItems = [...exExpensesLineItems, ...typicalExpensesLineItems];
    const expenses = lineItems
        ? lineItems.map((purchase) => ({
              name: purchase.description,
              amount: purchase.amountCents / 100.0, // convert cents to dollars
          }))
        : [];

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const pendingExpenses = useFetchPurchases({
        pageNumber: 0,
        resultsPerPage: 100,
        type: PurchaseLineItemType.PENDING,
    });
    const pendingExpensesLineItems =
        pendingExpenses.data?.purchases
            ?.flatMap((purchase) => purchase.lineItems)
            .filter((lineItem) => {
                return lineItem.type === "pending";
            }) ?? [];

    const [netDisasterVisisble, setNetDisasterVisible] = useState<boolean>(
        pendingExpensesLineItems.length > 0 ? true : false
    );

    return (
        <div className="p-[50px] flex flex-col gap-[23px] bg-[var(--slate)] min-h-screen w-full">
            {!hasDataLoading && (
                <NoDataPopupWrapper hasData={(hasData?.hasExternalData || hasData?.hasFinancialData) ?? false} />
            )}
            <div className="flex justify-between">
                <div>
                    <h2 className="text-[30px] font-bold">Expense Tracker</h2>
                    {hasData?.hasExternalData &&
                        <div>
                            <div className="flex gap-[8px] text-[var(--teal)] items-center"> <GoSync className="text-[var(--teal)]" />Last Synced on {mostRecent?.toLocaleDateString() ?? "--/--/--"}</div>
                        </div>
                    }
                </div>
                {!hasData?.hasExternalData && (
                    <div>
                        <Button
                            className="h-[34px] w-fit text-white text-[14px] bg-[var(--fuchsia)]"
                            onClick={onOpenImportModal}
                        >
                            {" "}
                            <FiUpload className="text-white" style={{ width: "14px" }} /> Upload CSV
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full gap-[16px]">
                <div className="flex gap-[16px] h-[364px]">
                    <div className="w-[60%]">
                        {hasData?.hasExternalData || hasData?.hasFinancialData ? (
                            netDisasterVisisble ? (
                                <NetDisasterExpense
                                    bannerData={bannerData ?? { status: "no-disaster" }}
                                    onDashboard={false}
                                    handleSwitchToReview={() => setNetDisasterVisible(false)}
                                />
                            ) : (
                                <ReviewExpenses
                                    handleSwitchToNetDisaster={() => setNetDisasterVisible(true)}
                                    lineItemsConfirmed={expenses.length}
                                    lineItemsPending={pendingExpensesLineItems.length}
                                    totalConfirmedExpenses={totalExpense}
                                    filterPending={() => setFilterPending(true)}
                                />
                            )
                        ) : (
                            <NetDisasterExpenseNoData />
                        )}
                    </div>
                    <div className="w-full">
                        {hasData ? <RevenueAndExpenses onDashboard={false} /> : <RevenueAndExpensesNoData />}
                    </div>
                </div>
                <ExpenseTable
                    title={"Business Transactions"}
                    rowOption={"collapsible"}
                    editableTags={true}
                    filterPending={filterPending}
                    setFilterPending={(fp: boolean) => setFilterPending(fp)}
                    hasData={(hasData?.hasExternalData || hasData?.hasFinancialData) ?? false}
                />
            </div>
            <TransactionImportModal isOpen={importModalOpen} onClose={onCloseImportModal} />
        </div>
    );
}
