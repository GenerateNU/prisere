import { FemaDisaster } from "../../entities/FemaDisaster";
import { LocationAddress } from "../../entities/LocationAddress";
import { logMessageToFile } from "../../utilities/logger";

// Cross-check if a location is in the same area as a disaster
export interface LocationFips {
  fipsStateCode: string;
  fipsCountyCode: string;
}

export interface CensusGeocodeResponse {
  result: {
    addressMatches: Array<{
      coordinates: {
        x: number;
        y: number;
      };
      geographies: {
        "Census Blocks": Array<{
          STATE: string;
          COUNTY: string;
        }>;
      };
    }>;
  };
}

export interface IFEMALocationMatcher {
  /**
   * Get FIPS codes from a location location
   * @param location - User's location details
   * @returns FIPS codes or null if not found
   */
  getLocationFips(location: Partial<LocationAddress>): Promise<LocationFips | null>;
}

export class FEMALocationMatcher implements IFEMALocationMatcher {
  /**
   * Get FIPS codes from a location location
   * @param location - User's location details
   * @returns FIPS codes or null if not found
   */
  async getLocationFips(location: Partial<LocationAddress>): Promise<LocationFips | null> {
    // Build address string from components
    const addressParts = [
        location.streetAddress,
        location.city,
        location.stateProvince,
        location.postalCode,
    ].filter(Boolean);

    const address = addressParts.join(", ");

    if (!address || address.trim() === "") {
        console.log("No address components provided, returning null");
        return null;
    }

    // Changed from 'locations' to 'geographies' endpoint
    const censusUrl = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress";
    const params = new URLSearchParams({
        address,
        benchmark: "Public_AR_Current",
        vintage: "Current_Current", // Required for geographies endpoint
        layers: "Census Blocks", // Specify the layer we want
        format: "json",
    });

    console.log(`${censusUrl}?${params}`)
    try {
        const response = await fetch(`${censusUrl}?${params}`);
        const data: CensusGeocodeResponse = await response.json();

        if (data.result?.addressMatches && data.result.addressMatches.length > 0) {
        const match = data.result.addressMatches[0];
        console.log("Match");
        console.log(match);

        // Try "2020 Census Blocks" first (current format), fallback to "Census Blocks"
        // Note "2020 Census Blocks" will show some 'not exist' error but this is the correct field
        const censusBlocks = match.geographies?.["2020 Census Blocks"] || 
                            match.geographies?.["Census Blocks"];

        if (censusBlocks && censusBlocks.length > 0) {
            const geo = censusBlocks[0];
            console.log(`Converted business location to fips state code ${geo.STATE}, county ${geo.COUNTY}`);
            
            return {
            fipsStateCode: geo.STATE,
            fipsCountyCode: geo.COUNTY,
            };
        } else {
            console.log("No census blocks data found in match");
            console.log("Available geographies:", Object.keys(match.geographies || {}));
        }
        }
    } catch (error) {
        console.error("Error geocoding location:", error);
    }

    return null;
    }
}