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
    ["typical", "bg-teal-100 text-teal-800 border border-teal-200"],
    ["extraneous", "bg-pink-100 text-pink-800 border border-pink-200"],
    ["pending", "bg-grey-100 text-grey-800 border border-grey-200"],
    ["suggested extraneous", "bg-yellow-100 text-yellow-800 border border-yellow-200"],
    ["suggested typical", "bg-blue-100 text-blue-800 border border-blue-200"],
]);
