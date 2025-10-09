import { randomUUID } from "crypto";
import { IFemaService } from "../../modules/clients/fema-client/service";
import { FemaDisaster } from "../../entities/FemaDisaster";

export class MockFemaService implements IFemaService {
    private mockDisasters: FemaDisaster[] = [];
    private shouldThrowError = false;
    private errorMessage = "Mock error";

    constructor() {
        this.mockDisasters = [
            {
                id: randomUUID(),
                disasterNumber: 4001,
                fipsStateCode: 12,
                declarationDate: new Date(),
                incidentBeginDate: new Date(),
                incidentEndDate: new Date(),
                fipsCountyCode: 123,
                declarationType: "DR",
                designatedArea: "Test County",
                designatedIncidentTypes: "Hurricane",
            } as FemaDisaster,
            {
                id: randomUUID(),
                disasterNumber: 4002,
                fipsStateCode: 6,
                declarationDate: new Date(),
                incidentBeginDate: new Date(),
                incidentEndDate: new Date(),
                fipsCountyCode: 456,
                declarationType: "EM",
                designatedArea: "Test City",
                designatedIncidentTypes: "Flood",
            } as FemaDisaster,
        ];
    }

    async fetchFemaDisasters({ lastRefreshDate }: { lastRefreshDate: Date }): Promise<FemaDisaster[]> {
        if (this.shouldThrowError) {
            throw new Error(this.errorMessage);
        }

        // Filter disasters based on lastRefreshDate (simulate API behavior)
        return this.mockDisasters.filter((disaster) => {
            const disasterDate = new Date(disaster.declarationDate);
            return disasterDate > lastRefreshDate;
        });
    }

    async preloadDisasters(): Promise<void> {
        if (this.shouldThrowError) {
            throw new Error(this.errorMessage);
        }

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Simulate preloading by calling fetchFemaDisasters
        await this.fetchFemaDisasters({ lastRefreshDate: threeMonthsAgo });
    }

    // Helper methods for testing
    setMockDisasters(disasters: FemaDisaster[]): void {
        this.mockDisasters = disasters;
    }

    addMockDisaster(disaster: FemaDisaster): void {
        this.mockDisasters.push(disaster);
    }

    clearMockDisasters(): void {
        this.mockDisasters = [];
    }

    setError(shouldThrow: boolean, message = "Mock error"): void {
        this.shouldThrowError = shouldThrow;
        this.errorMessage = message;
    }

    getMockDisasters(): FemaDisaster[] {
        return [...this.mockDisasters];
    }

    // Factory method to create mock disasters
    static createMockDisaster(overrides: Partial<FemaDisaster> = {}): FemaDisaster {
        return {
            id: randomUUID(),
            disasterNumber: 4000 + Math.floor(Math.random() * 1000),
            fipsStateCode: 12,
            declarationDate: new Date().toISOString(),
            incidentBeginDate: new Date().toISOString(),
            incidentEndDate: new Date().toISOString(),
            fipsCountyCode: 123,
            declarationType: "DR",
            designatedArea: "Mock County",
            designatedIncidentTypes: "Hurricane",
            ...overrides,
        } as FemaDisaster;
    }
}

// Export mock disaster data for use in tests
export const mockFemaDisasterData = {
    single: {
        id: randomUUID(),
        disasterNumber: 4001,
        fipsStateCode: 12,
        declarationDate: "2024-01-15T00:00:00.000Z",
        incidentBeginDate: "2024-01-10T00:00:00.000Z",
        incidentEndDate: "2024-01-20T00:00:00.000Z",
        fipsCountyCode: 123,
        declarationType: "DR",
        designatedArea: "Test County",
        designatedIncidentTypes: "Hurricane",
    },
    multiple: [
        {
            id: randomUUID(),
            disasterNumber: 4001,
            fipsStateCode: 12,
            declarationDate: "2024-01-15T00:00:00.000Z",
            incidentBeginDate: "2024-01-10T00:00:00.000Z",
            incidentEndDate: "2024-01-20T00:00:00.000Z",
            fipsCountyCode: 123,
            declarationType: "DR",
            designatedArea: "Test County",
            designatedIncidentTypes: "Hurricane",
        },
        {
            id: randomUUID(),
            disasterNumber: 4002,
            fipsStateCode: 6,
            declarationDate: "2024-02-01T00:00:00.000Z",
            incidentBeginDate: "2024-01-28T00:00:00.000Z",
            incidentEndDate: "2024-02-05T00:00:00.000Z",
            fipsCountyCode: 456,
            declarationType: "EM",
            designatedArea: "Test City",
            designatedIncidentTypes: "Flood",
        },
    ],
};
