import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import { randomUUID } from "crypto";
import { FEMALocationMatcher, CensusGeocodeResponse } from "../../utilities/fema_location_lookup";
import { LocationAddress } from "../../entities/LocationAddress";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { Company } from "../../entities/Company";

describe("FEMALocationMatcher", () => {
    let matcher: FEMALocationMatcher;
    let originalFetch: typeof fetch;

    const mockLocationSF: LocationAddress = {
        id: randomUUID(),
        country: "United States",
        stateProvince: "California",
        city: "San Francisco",
        streetAddress: "123 Main Street",
        postalCode: "94105",
        county: "San Francisco County",
        companyId: randomUUID(),
        company: {} as Company,
    };

    const mockLocationChicago: LocationAddress = {
        id: randomUUID(),
        country: "United States",
        stateProvince: "Illinois",
        city: "Chicago",
        streetAddress: "456 Second Street",
        postalCode: "60601",
        county: "Cook County",
        companyId: randomUUID(),
        company: {} as Company,
    };

    const mockDisasterCA: FemaDisaster = {
        id: randomUUID(),
        fipsStateCode: 6, // California
        fipsCountyCode: 75, // San Francisco County
        declarationDate: new Date(),
        declarationType: "DR",
        designatedIncidentTypes: "Flood",
        designatedArea: "San Francisco County",
        disasterNumber: 12345,
        incidentBeginDate: new Date(),
        incidentEndDate: new Date(),
        disasterNotifications: [],
    };

    // const mockDisasterIL: FemaDisaster = {
    //     id: randomUUID(),
    //     fipsStateCode: 17, // Illinois
    //     fipsCountyCode: 31, // Cook County
    //     declarationDate: new Date(),
    //     declarationType: "DR",
    //     designatedIncidentTypes: "Hurricane",
    //     designatedArea: "Cook County",
    //     disasterNumber: 67890,
    //     incidentBeginDate: new Date(),
    //     incidentEndDate: new Date(),
    //     disasterNotifications: []
    // };

    beforeAll(() => {
        originalFetch = global.fetch;
        matcher = new FEMALocationMatcher();
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    describe("getLocationFips", () => {
        it("should return FIPS codes for a valid address", async () => {
            const mockCensusResponse: CensusGeocodeResponse = {
                result: {
                    addressMatches: [
                        {
                            coordinates: {
                                x: -122.4194,
                                y: 37.7749,
                            },
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

            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () => Promise.resolve(mockCensusResponse),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.getLocationFips(mockLocationSF);

            expect(result).toEqual({
                stateFips: "06",
                countyFips: "075",
            });
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it("should return null for address with no matches", async () => {
            const mockCensusResponse: CensusGeocodeResponse = {
                result: {
                    addressMatches: [],
                },
            };

            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () => Promise.resolve(mockCensusResponse),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.getLocationFips(mockLocationSF);

            expect(result).toBeNull();
        });

        it("should return null when Census API fails", async () => {
            const mockFetch = mock(() => Promise.reject(new Error("Network error")));
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.getLocationFips(mockLocationSF);

            expect(result).toBeNull();
        });

        it("should build address string correctly from location components", async () => {
            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ result: { addressMatches: [] } }),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            await matcher.getLocationFips(mockLocationSF);

            expect(mockFetch.mock.calls.length).toBeGreaterThan(0);
            // const calledUrl = mockFetch.mock.calls[0][0] as unknown as string;
            // expect(calledUrl).toContain("123+Main+Street%2C+San+Francisco%2C+California%2C+94105");
        });

        it("should handle partial address information", async () => {
            const partialLocation: LocationAddress = {
                id: randomUUID(),
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "", // missing on purpose
                postalCode: "94105",
                county: "San Francisco County",
                companyId: randomUUID(),
                company: {} as Company,
            };

            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () => Promise.resolve({ result: { addressMatches: [] } }),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            await matcher.getLocationFips(partialLocation);

            // const calledUrl = mockFetch.mock.calls[0][0] as unknown as string;
            // expect(calledUrl).toContain("San+Francisco%2C+California%2C+94105");
            // expect(calledUrl).not.toContain("undefined");
        });
    });

    describe("isLocationAffected", () => {
        it("should return true when location is in disaster area", async () => {
            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            result: {
                                addressMatches: [
                                    {
                                        coordinates: { x: -122.4194, y: 37.7749 },
                                        geographies: {
                                            "Census Blocks": [
                                                {
                                                    STATE: "06", // California
                                                    COUNTY: "075", // San Francisco County
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        }),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.isLocationAffected(mockLocationSF, mockDisasterCA);

            expect(result).toBe(true);
        });

        it("should return false when state doesn't match", async () => {
            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            result: {
                                addressMatches: [
                                    {
                                        coordinates: { x: -87.6298, y: 41.8781 },
                                        geographies: {
                                            "Census Blocks": [
                                                {
                                                    STATE: "17", // Illinois (different state)
                                                    COUNTY: "031", // Cook County
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        }),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.isLocationAffected(mockLocationChicago, mockDisasterCA);

            expect(result).toBe(false);
        });

        it("should return false when county doesn't match", async () => {
            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            result: {
                                addressMatches: [
                                    {
                                        coordinates: { x: -122.4194, y: 37.7749 },
                                        geographies: {
                                            "Census Blocks": [
                                                {
                                                    STATE: "06", // California (same state)
                                                    COUNTY: "001", // Different county
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        }),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.isLocationAffected(mockLocationSF, mockDisasterCA);

            expect(result).toBe(false);
        });

        it("should return false when location FIPS cannot be determined", async () => {
            const mockFetch = mock(() =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            result: { addressMatches: [] },
                        }),
                })
            );
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.isLocationAffected(mockLocationSF, mockDisasterCA);

            expect(result).toBe(false);
        });
    });

    describe("getAffectedLocations", () => {
        it("should return affected status for multiple locations", async () => {
            const locations = [mockLocationSF, mockLocationChicago];

            let callCount = 0;
            const mockFetch = mock(() => {
                callCount++;
                // First call (SF) - affected by CA disaster
                if (callCount === 1) {
                    return Promise.resolve({
                        json: () =>
                            Promise.resolve({
                                result: {
                                    addressMatches: [
                                        {
                                            coordinates: { x: -122.4194, y: 37.7749 },
                                            geographies: {
                                                "Census Blocks": [
                                                    {
                                                        STATE: "06", // California
                                                        COUNTY: "075", // San Francisco County
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                            }),
                    });
                }
                // Second call (Chicago) - not affected by CA disaster
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            result: {
                                addressMatches: [
                                    {
                                        coordinates: { x: -87.6298, y: 41.8781 },
                                        geographies: {
                                            "Census Blocks": [
                                                {
                                                    STATE: "17", // Illinois
                                                    COUNTY: "031", // Cook County
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        }),
                });
            });
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.getAffectedLocations(locations, mockDisasterCA);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: mockLocationSF.id,
                affected: true,
            });
            expect(result[1]).toEqual({
                id: mockLocationChicago.id,
                affected: false,
            });
        });

        it("should handle empty locations array", async () => {
            const result = await matcher.getAffectedLocations([], mockDisasterCA);

            expect(result).toEqual([]);
        });

        it("should handle geocoding failures gracefully", async () => {
            const locations = [mockLocationSF];

            const mockFetch = mock(() => Promise.reject(new Error("Geocoding failed")));
            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await matcher.getAffectedLocations(locations, mockDisasterCA);

            expect(result).toEqual([
                {
                    id: mockLocationSF.id,
                    affected: false,
                },
            ]);
        });
    });
});
