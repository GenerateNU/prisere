import { INCIDENT_MAPPING } from "../types/fema-disaster";

export function getIncidentCodeMeaning(declarationType: string): string {
    if (declarationType in INCIDENT_MAPPING) {
        const meaning = INCIDENT_MAPPING[declarationType as keyof typeof INCIDENT_MAPPING];
        return meaning.toString();
    } else {
        return declarationType.toString();
    }
}
