import { describe, test, expect, beforeEach } from "bun:test";
import { FEMALocationMatcher } from "../../modules/clients/fips-location-matching/service";
import { LocationAddress } from "../../entities/LocationAddress";

describe("FEMA Location Matcher - Real API Integration Tests", () => {
    let realService: FEMALocationMatcher;

    beforeEach(() => {
        realService = new FEMALocationMatcher();
    });

    test("should return FIPS codes for valid San Francisco address", async () => {
        const location: Partial<LocationAddress> = {
            streetAddress: "1 Market Street",
            city: "San Francisco",
            stateProvince: "California",
            postalCode: "94105",
        };

        const result = await realService.getLocationFips(location);

        expect(result).toBeDefined();
        expect(result?.fipsStateCode).toBe("06"); // California
        expect(result?.fipsCountyCode).toBe("075"); // San Francisco County
    }, 10000);

    test("should return FIPS codes for valid New York address", async () => {
        const location: Partial<LocationAddress> = {
            streetAddress: "350 5th Avenue",
            city: "New York",
            stateProvince: "New York",
            postalCode: "10118",
        };

        const result = await realService.getLocationFips(location);

        expect(result).toBeDefined();
        expect(result?.fipsStateCode).toBe("36"); // New York
        expect(result?.fipsCountyCode).toBe("061"); // New York County (Manhattan)
    }, 10000);

    test("should return null for completely invalid address", async () => {
        const location: Partial<LocationAddress> = {
            streetAddress: "999999 Nonexistent Street",
            city: "Faketown",
            stateProvince: "Nowhere",
            postalCode: "00000",
        };

        const result = await realService.getLocationFips(location);

        expect(result).toBeNull();
    }, 10000);

    test("should return null for empty location data", async () => {
        const location: Partial<LocationAddress> = {};

        const result = await realService.getLocationFips(location);

        expect(result).toBeNull();
    }, 10000);

    test("should handle partial address data", async () => {
        const location: Partial<LocationAddress> = {
            city: "Los Angeles",
            stateProvince: "California",
        };

        const result = await realService.getLocationFips(location);

        expect(result).toBeNull();
    }, 10000);
});
