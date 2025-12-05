"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getPurchaseTypeString, getCategoriesString } from "../utility-functions";
import { CategoryBadgeSpan } from "./category-options";
import { DisasterType, PurchaseWithLineItems } from "@/types/purchase";
import SideViewTable from "./side-view-table";
import { DisasterBadgeSpan } from "./disaster-options";

interface SideViewProps {
    purchase: PurchaseWithLineItems | null;
    open: boolean;
    onOpenChange: () => void;
}

export default function ExpenseSideView({ purchase, open, onOpenChange }: SideViewProps) {
    if (!purchase) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange} >
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                <div className="px-6 pt-10">
                    <SheetHeader className="pt-13 px-5">
                        <SheetTitle className="text-2xl">{purchase.vendor ? purchase.vendor : "Unknown Vendor"}</SheetTitle>
                    </SheetHeader>

                    <div className="space-y-4 mb-8 ">
                        <DetailRow label="Amount" value={"$" + (purchase.totalAmountCents / 100).toFixed(2)} />
                        <DetailRow
                            label="Category"
                            value={categoryTagsMainPurchase(getCategoriesString(purchase.lineItems))}
                        />
                        <DetailRow label="Date" value={new Date(purchase.dateCreated).toLocaleDateString()} />
                        <DetailRow
                            label="Disaster Related"
                            value={<DisasterTypeTag type={getPurchaseTypeString(purchase.lineItems)} />}
                        />
                    </div>
                </div>

                <div className="border-t pt-8 mx-[5%]">
                    <h3 className="text-xl font-semibold mb-6">Items in expense</h3>
                    <SideViewTable lineItems={purchase.lineItems} />
                </div>
            </SheetContent>
        </Sheet>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 px-6 select-none">
            <span className="text-muted-foreground">{label}</span>
            <div>{value}</div>
        </div>
    );
}

function categoryTagsMainPurchase(category?: string) {
    if (!category) {
        return <p> No categories </p>;
    }
    const categories = category.length > 0 ? category.split(",") : [];
    return (
        <div className="inline-flex flex-wrap items-center gap-1 select-none">
            {categories.slice(0, 3).map((cat, index) => (
                <CategoryBadgeSpan key={index} category={cat} />
            ))}
        </div>
    );
}

export function DisasterTypeTag({ type }: { type: DisasterType | null }) {
    if (!type) {
        return <p className="select-none"> Purchase type not available </p>;
    }
    return <DisasterBadgeSpan type={type} />;
}
