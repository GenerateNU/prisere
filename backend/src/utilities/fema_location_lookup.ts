import { FemaDisaster } from "../entities/FemaDisaster";
import { LocationAddress } from "../entities/LocationAddress";

// Cross-check if a location is in the same area as a disaster

export interface LocationFips {
  stateFips: string;
  countyFips: string;
  fullFips: string;
}

export interface CensusGeocodeResponse {
  result: {
    addressMatches: Array<{
      coordinates: {
        x: number;
        y: number;
      };
      geographies: {
        'Census Blocks': Array<{
          STATE: string;
          COUNTY: string;
        }>;
      };
    }>;
  };
}

export class FEMALocationMatcher {
  /**
   * Check if a location location matches a disaster area
   * @param businessLocation - User's location details
   * @param femaDisaster - Disaster area with FIPS codes
   * @returns true if location is in the disaster area
   */
  async isLocationAffected(
    businessLocation: LocationAddress,
    femaDisaster: FemaDisaster
  ): Promise<boolean> {
    // Get FIPS codes for the location's location
    const locationFips = await this.getLocationFips(businessLocation);

    console.log('Location FIPS:', locationFips);
    console.log('Disaster FIPS:', { state: femaDisaster.fipsStateCode, county: femaDisaster.fipsCountyCode });
    console.log('State match:', Number(locationFips?.stateFips) === femaDisaster.fipsStateCode);
    console.log('County match:', Number(locationFips?.countyFips) === femaDisaster.fipsCountyCode);
    
    if (!locationFips) {
      return false;
    }

    if (Number(locationFips.stateFips) !== femaDisaster.fipsStateCode) {
      return false;
    }
    if (Number(locationFips.countyFips) !== femaDisaster.fipsCountyCode) {
      return false;
    }

    // State and county match
    return true;
  }

  /**
   * Get FIPS codes from a location location
   * @param location - User's location details
   * @returns FIPS codes or null if not found
   */
  async getLocationFips(location: LocationAddress): Promise<LocationFips | null> {
    // Build address string from components
    const addressParts = [
      location.streetAddress,
      location.city,
      location.stateProvince,
      location.postalCode
    ].filter(Boolean);
    
    const address = addressParts.join(', ');

    // Geocode to get FIPS codes
    const censusUrl = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';
    const params = new URLSearchParams({
      address,
      benchmark: 'Public_AR_Current',
      format: 'json'
    });

    try {
      const response = await fetch(`${censusUrl}?${params}`);
      const data: CensusGeocodeResponse = await response.json();

      if (data.result?.addressMatches && data.result.addressMatches.length > 0) {
        const match = data.result.addressMatches[0];
        const geo = match.geographies['Census Blocks'][0];

        return {
          stateFips: geo.STATE,
          countyFips: geo.COUNTY,
          fullFips: geo.STATE + geo.COUNTY
        };
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }

    return null;
  }

  /**
   * Check multiple locations against a disaster
   * @param locations - Array of location locations
   * @param femaDisaster - Disaster area with FIPS codes
   * @returns Array of affected locations
   */
  async getAffectedLocations(
    locations: Array<LocationAddress>,
    femaDisaster: FemaDisaster
  ): Promise<Array<{ id: string | number; affected: boolean }>> {
    const results = [];

    for (const location of locations) {
      const affected = await this.isLocationAffected(location, femaDisaster);
      results.push({
        id: location.id,
        affected
      });
    }

    return results;
  }
}