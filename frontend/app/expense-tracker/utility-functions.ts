import { DisasterType } from "@/types/purchase";

export function getCategoriesString(lineItems: { category?: string | null }[]): string {
    return lineItems
        .map((li) => li.category)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index)
        .join(",");
}

export function getPurchaseTypeString(lineItems: { type?: string | null }[]): DisasterType | null {
    const types = lineItems.map((li) => li.type).filter(Boolean);

    if (types.length === 0) {
        return "typical";
    } else {
        return types.includes("extraneous") ? "extraneous" : "typical";
    }
}

export function getLineItemDescriptions(lineItems: { description?: string | null }[]): string {
    return lineItems
        .map((li) => li.description)
        .filter(Boolean)
        .join(", ");
}
