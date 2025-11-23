"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getPurchaseTypeString, getCategoriesString } from "../utility-functions";
import { CategoryBadge } from "./category-options";
import { DisasterType, PurchaseWithLineItems } from "@/types/purchase";
import { DISASTER_TYPE_COLORS, DISASTER_TYPE_LABELS } from "./disaster-options";
import SideViewTable from "./side-view-table";


interface SideViewProps {
  purchase: PurchaseWithLineItems | null;
  open: boolean; 
  onOpenChange: () => void; 
}

export default function ExpenseSideView({ purchase, open, onOpenChange }: SideViewProps) {
  if (!purchase) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Target</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <DetailRow label="Amount" value={(purchase.totalAmountCents / 100).toFixed(2)}/>
          <DetailRow 
          label="Category" 
          value={categoryTagsMainPurchase(getCategoriesString(purchase.lineItems))} />
          <DetailRow label="Date" value={purchase.dateCreated} />
          <DetailRow 
          label="Disaster Related" 
          value={<DisasterTypeTag type={getPurchaseTypeString(purchase.lineItems)}/>} />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Items in expense</h3>
          <SideViewTable lineItems={purchase.lineItems} />
        </div>
      </SheetContent>
    </Sheet>
  )
}



function DetailRow({ label, value }: { 
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <div>{value}</div>
    </div>
  )
}


function categoryTagsMainPurchase(category?: string) {
  if (!category) {
    return <p> No categories </p>
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

export function DisasterTypeTag({type }: { type:  DisasterType | null }) {
  if (!type) {
    return <p> Purchase type not available </p>
  }
  const displayType = DISASTER_TYPE_LABELS.get(type);
  return (
    <span
    className={`px-3 py-1 rounded-md text-sm font-semibold cursor-pointer ${DISASTER_TYPE_COLORS.get(type)}`}
    >
      {displayType}
    </span>
  );
}

