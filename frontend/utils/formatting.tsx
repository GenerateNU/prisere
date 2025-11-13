import { INCIDENT_MAPPING } from "@/types/notifications";

export function getDeclarationTypeMeanings(declarationType: string): string {
    switch (declarationType) {
        case "EM":
            return "Emergency declaration";
        case "DR":
            return "Major disaster";
        case "FM":
            return "Fire management";
        default:
            return "";
    }
}

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

export function getIncidentTypeMeanings(designatedIncidentTypes: string): string[] {
    const incidentMeanings: string[] = [];
    const incidentTypes = designatedIncidentTypes.split(/\s*,\s*/); // Split by commas and any white space between
    for (const type of incidentTypes) {
        if (type in INCIDENT_MAPPING) {
            const meaning = INCIDENT_MAPPING[type as keyof typeof INCIDENT_MAPPING];
            incidentMeanings.push(meaning.toString());
        } else {
            incidentMeanings.push(type.toString());
        }
    }
    return incidentMeanings;
}
