import { INCIDENT_MAPPING } from "../types/fema-disaster";

// EM - Emergency declaration
// DR - Major disaster
// FM - fire management
export function getDeclarationTypeMeanings(declarationType: string): string {
    switch (declarationType) {
        case 'EM':
            return 'Emergency declaration';
        case 'DR':
            return 'Major disaster';
        case 'FM':
            return 'Fire management';
        default:
            return declarationType;
    }
}

export function getIncidentTypeMeanings(designatedIncidentTypes: string) : string[] {
    let incidentMeanings: string[] = [];
    const incidentTypes = designatedIncidentTypes.split(/\s*,\s*/); // Split by commas and any white space between
    for (const type in incidentTypes) {
        if (type in INCIDENT_MAPPING) {
            const meaning = INCIDENT_MAPPING[type as keyof typeof INCIDENT_MAPPING];
            console.log(`Type ${type} has meaning ${meaning}`)
            incidentMeanings.concat(...incidentMeanings, meaning.toString());
        } else {
            incidentMeanings.concat(...incidentMeanings, type.toString());
        }
    }
    return incidentMeanings;
}
