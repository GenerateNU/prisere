"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getPurchaseTypeString, getCategoriesString } from "../utility-functions";
import { CategoryBadge } from "./category-options";
import { DisasterType, PurchaseWithLineItems } from "@/types/purchase";
import SideViewTable from "./side-view-table";
import { DISASTER_TYPE_COLORS, DISASTER_TYPE_LABELS } from "@/types/disaster";

interface SideViewProps {
    purchase: PurchaseWithLineItems | null;
    open: boolean;
    onOpenChange: () => void;
}

export default function ExpenseSideView({ purchase, open, onOpenChange }: SideViewProps) {
    if (!purchase) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader className="pt-[8%] px-[4.5%]">
                    <SheetTitle className="text-2xl">{purchase.vendor ? purchase.vendor : "Unknown Vendor"}</SheetTitle>
                </SheetHeader>

                <div className="space-y-4 mb-8">
                    <DetailRow label="Amount" value={(purchase.totalAmountCents / 100).toFixed(2)} />
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
        <div className="grid grid-cols-[1fr_3fr] gap-4 px-[5%]">
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
        <>
            {categories.slice(0, 3).map((cat, index) => (
                <CategoryBadge
                    key={index}
                    category={cat}
                    allCategories={categories}
                    lineItemIds={[]}
                    editableTags={false}
                />
            ))}
        </>
    );
}

export function DisasterTypeTag({ type }: { type: DisasterType | null }) {
    if (!type) {
        return <p> Purchase type not available </p>;
    }
    const displayType = DISASTER_TYPE_LABELS.get(type);
    return (
        <span className={`px-3 py-1 rounded-md text-sm font-semibold cursor-pointer ${DISASTER_TYPE_COLORS.get(type)}`}>
            {displayType}
        </span>
    );
}
