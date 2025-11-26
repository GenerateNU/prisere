export function colorFromSevarity(value: string | undefined): string {
    if (!value) return "purple";

    switch (value?.toLowerCase()) {
        case "very high":
            return "var(--fuchsia)";
        case "relatively high":
            return "var(--fuchsia)";
        case "relatively moderate":
            return "var(--gold)";
        case "relatively low":
            return "var(--teal)";
        case "very low":
            return "var(--teal)";
        case "no rating":
            return "var(--slate)";
        case "not applicable":
            return "var(--slate)";
        case "insufficient data":
            return "var(--slate)";
        default:
            return "green";
    }
}
