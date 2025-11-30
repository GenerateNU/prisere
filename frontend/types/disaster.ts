import { paths } from "@/schema";
import { DisasterType } from "./purchase";

export type FemaDisaster = paths["/disaster"]["post"]["responses"][201]["content"]["application/json"];

export const DISASTER_TYPE_LABELS = new Map<DisasterType, string>([
    ["typical", "Non-Disaster"],
    ["extraneous", "Disaster"],
    ["suggested extraneous", "Suggested: Disaster"],
    ["suggested typical", "Suggested: Typical"],
    ["pending", "Pending"],
]);
export const DISASTER_TYPE_LABELS_TO_CHANGE = new Map<DisasterType, string>([
    ["typical", "Non-Disaster"],
    ["extraneous", "Disaster"],
]);
export const DISASTER_TYPE_COLORS = new Map([
    ["typical", "bg-light-teal text-teal"],
    ["extraneous", "bg-light-fuchsia text-fuchsia"],
    ["pending", "bg-gray text-charcoal"],
    ["suggested extraneous", "bg-yellow-100 text-yellow-800 "],
    ["suggested typical", "bg-blue-100 text-blue-800"],
]);
