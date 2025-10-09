import {
    IFEMALocationMatcher,
    LocationFips,
    CensusGeocodeResponse,
} from "../../modules/fips-location-matching/service";
import { LocationAddress } from "../../entities/LocationAddress";

export class MockFEMALocationMatcher implements IFEMALocationMatcher {
    static readonly mockFipsData: Record<string, LocationFips> = {
        "123 Ocean Drive, Miami, Florida, 33139": {
            fipsStateCode: "12",
            fipsCountyCode: "086",
        },
        "456 Main Street, Houston, Texas, 77002": {
            fipsStateCode: "48",
            fipsCountyCode: "201",
        },
        "789 Sunset Blvd, Los Angeles, California, 90028": {
            fipsStateCode: "06",
            fipsCountyCode: "037",
        },
        "321 Broadway, New York, New York, 10007": {
            fipsStateCode: "36",
            fipsCountyCode: "061",
        },
        "123 Main Street, San Francisco, California, 94105": {
            fipsStateCode: "06",
            fipsCountyCode: "075",
        },
    };

    private shouldFail: boolean = false;
    private shouldReturnNull: boolean = false;

    constructor(options?: { shouldFail?: boolean; shouldReturnNull?: boolean }) {
        this.shouldFail = options?.shouldFail ?? false;
        this.shouldReturnNull = options?.shouldReturnNull ?? false;
    }

    async getLocationFips(location: Partial<LocationAddress>): Promise<LocationFips | null> {
        if (this.shouldFail) {
            throw new Error("Mock API error - network failure");
        }

        if (this.shouldReturnNull) {
            return null;
        }

        // Build address string like the real function
        const addressParts = [
            location.streetAddress,
            location.city,
            location.stateProvince,
            location.postalCode,
        ].filter(Boolean);

        const address = addressParts.join(", ");

        // Return mock data based on address
        const mockData = MockFEMALocationMatcher.mockFipsData[address];
        if (mockData) {
            return mockData;
        }

        // Reutn default mock data
        return null;
    }

    reset() {
        this.shouldFail = false;
        this.shouldReturnNull = false;
    }
}

// Mock the global fetch for when testing the real service with mocked HTTP calls
export function mockCensusAPI() {
    const originalFetch = global.fetch;

    const mockSuccessResponse: CensusGeocodeResponse = {
        result: {
            addressMatches: [
                {
                    coordinates: { x: -122.4194, y: 37.7749 },
                    geographies: {
                        "Census Blocks": [
                            {
                                STATE: "06",
                                COUNTY: "075",
                            },
                        ],
                    },
                },
            ],
        },
    };

    const mockFailureResponse: CensusGeocodeResponse = {
        result: {
            addressMatches: [],
        },
    };
    const createMockResponse = (data: any, ok: boolean = true, status: number = 200): Response => {
        return {
            ok,
            status,
            statusText: ok ? "OK" : "Internal Server Error",
            json: async () => data,
            text: async () => JSON.stringify(data),
            blob: async () => new Blob([JSON.stringify(data)]),
            arrayBuffer: async () => new ArrayBuffer(0),
            formData: async () => new FormData(),
            headers: new Headers({ "content-type": "application/json" }),
            redirected: false,
            type: "basic" as ResponseType,
            url: "",
            body: null,
            bodyUsed: false,
            clone: () => createMockResponse(data, ok, status),
        } as Response;
    };

    const mockFetch = async (url: string | URL | Request): Promise<Response> => {
        const urlString = url.toString();

        if (urlString.includes("")) {
            return createMockResponse(mockSuccessResponse, true, 200);
        } else if (urlString.includes("Invalid Address")) {
            return createMockResponse(mockFailureResponse, true, 200);
        } else {
            return createMockResponse({ error: "Server Error" }, false, 500);
        }
    };

    global.fetch = mockFetch as typeof fetch;

    return {
        restore: () => {
            global.fetch = originalFetch;
        },
    };
}
