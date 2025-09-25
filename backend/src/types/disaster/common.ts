import z from "zod";

export const FIPSState = z.number().gte(1).lte(56);
export const FIPSCounty = z.number().gte(1000).lte(56045);

const INCIDENT_MAPPING = {
    "0": "Not applicable",
    "1": "Explosion",
    "2": "Straight-Line Winds",
    "3": "Tidal Wave",
    "4": "Tropical Storm",
    "5": "Winter Storm",
    "8": "Tropical Depression",
    A: "Tsunami",
    B: "Biological",
    C: "Coastal Storm",
    D: "Drought",
    E: "Earthquake",
    F: "Flood",
    G: "Freezing",
    H: "Hurricane",
    I: "Terrorist",
    J: "Typhoon",
    K: "Dam/Levee Break",
    L: "Chemical",
    M: "Mud/Landslide",
    N: "Nuclear",
    O: "Severe Ice Storm",
    P: "Fishing Losses",
    Q: "Crop Losses",
    R: "Fire",
    S: "Snowstorm",
    T: "Tornado",
    U: "Civil Unrest",
    V: "Volcanic Eruption",
    W: "Severe Storm",
    X: "Toxic Substances",
    Y: "Human Cause",
    Z: "Other",
} as const;

type IncidentCode = keyof typeof INCIDENT_MAPPING;

const INCIDENT_CODES = Object.keys(INCIDENT_MAPPING) as IncidentCode[];

export const LABEL_TO_CODE: Record<string, IncidentCode> = Object.fromEntries(
    Object.entries(INCIDENT_MAPPING).map(([code, label]) => [
        label,
        code as IncidentCode
    ])
)

export const incidentTypeString = z.string().nullable().refine((s) => {
    /**
     * the format should be: "[code],[code],[code],..."
     * or null as it will not be null when merged with incidentType field
     */
    if (s === null) return true;
    const codes = s.split(",").map((s) => s.trim());
    return codes.length > 0 && codes.every((c) => INCIDENT_CODES.includes(c as IncidentCode));
});
