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
    } else if (types.includes("extraneous")) {
        return "extraneous";
    } else if (types.includes("typical")) {
        return "extraneous";
    } else if (types.includes("suggested extraneous")) {
        return "suggested extraneous";
    } else if (types.includes("suggested typical")) {
        return "suggested typical";
    } else {
        return "pending";
    }
}

export function getLineItemDescriptions(lineItems: { description?: string | null }[]): string {
    return lineItems
        .map((li) => li.description)
        .filter(Boolean)
        .join(", ");
}
