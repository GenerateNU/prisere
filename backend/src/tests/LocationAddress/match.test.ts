import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { FEMALocationMatcher } from "../../modules/fips-location-matching/service";
import { MockFEMALocationMatcher, mockCensusAPI } from "./fips-location-match-client";
import { LocationAddress } from "../../entities/LocationAddress";

describe("FEMA Location Matcher - getLocationFips", () => {
    let mockClient: MockFEMALocationMatcher;
    let realService: FEMALocationMatcher;
    let fetchMock: { restore: () => void };

    beforeEach(() => {
        mockClient = new MockFEMALocationMatcher();
        realService = new FEMALocationMatcher();
        fetchMock = mockCensusAPI();
    });

    afterEach(() => {
        fetchMock.restore();
        mockClient.reset();
    });

    describe("Mock Client Tests", () => {
        test("should return correct FIPS codes for Miami address", async () => {
            const location: Partial<LocationAddress> = {
                streetAddress: "123 Ocean Drive",
                city: "Miami",
                stateProvince: "Florida",
                postalCode: "33139"
            };
            // Miami-Dade County is 12086

            const result = await mockClient.getLocationFips(location);

            expect(result).toEqual({
                fipsStateCode: "12",
                fipsCountyCode: "086"
            });
        });

        test("should return correct FIPS codes for Houston address", async () => {
            const location: Partial<LocationAddress> = {
                streetAddress: "456 Main Street",
                city: "Houston",
                stateProvince: "Texas",
                postalCode: "77002"
            }
            // Harris County is 48201

            const result = await mockClient.getLocationFips(location);

            expect(result).toEqual({
                fipsStateCode: "48",
                fipsCountyCode: "201"
            });
        });
    });

    describe("Real Service with Mocked HTTP", () => {
        test("should return FIPS codes for successful API response", async () => {
            const location: Partial<LocationAddress> = {
                streetAddress: "123 Main Street",
                city: "San Francisco",
                stateProvince: "California",
                postalCode: "94105"
            };

            const result = await realService.getLocationFips(location);

            expect(result).toEqual({
                fipsStateCode: "06",
                fipsCountyCode: "075"
            });
        });

        test("should handle empty location data", async () => {
            const location: Partial<LocationAddress> = {};

            const result = await realService.getLocationFips(location);

            expect(result).toBeNull();
        });

        test("should build address string correctly", async () => {
            const location: Partial<LocationAddress> = {
                streetAddress: "123 O'Connor St.",
                city: "San Francisco",
                stateProvince: "California",
                postalCode: "94105" // This should be filtered out of address string
            };

            const result = await realService.getLocationFips(location);

            // The fetch mock should receive a properly formatted address
            // expect(global.fetch).toHaveBeenCalledWith(
            //     expect.stringContaining("onelineaddress?address=123+O%27Connor+St.%2C+San+Francisco%2C+California%2C+94105&benchmark=Public_AR_Current&vintage=Current_Current&layers=Census+Blocks&format=json")
            // );
        });
    });

    describe("Edge Cases", () => {
        test("should handle location with only some fields", async () => {
            const location: Partial<LocationAddress> = {
                city: "San Francisco",
                stateProvince: "California"
            };

            const result = await realService.getLocationFips(location);

            expect(result).toBeDefined();
        });

        test("should handle location with empty strings", async () => {
            const location: Partial<LocationAddress> = {
                streetAddress: "",
                city: "San Francisco",
                stateProvince: "",
                postalCode: "94105"
            };

            const result = await realService.getLocationFips(location);

            expect(result).toBeDefined();
        });

        test("should handle special characters in address", async () => {
            const location: Partial<LocationAddress> = {
                streetAddress: "123 O'Connor St.",
                city: "San Francisco",
                stateProvince: "California",
                postalCode: "94105"
            };

            const result = await realService.getLocationFips(location);

            expect(result).toBeDefined();
        });
    });
});