import { setSeederFactory } from "typeorm-extension";
import { LocationAddress } from "../../entities/LocationAddress";

export default setSeederFactory(LocationAddress, (faker) => {
    const locationAddress = new LocationAddress();
    locationAddress.id = faker.string.uuid();
    locationAddress.streetAddress = faker.location.streetAddress();
    locationAddress.city = faker.location.city();
    locationAddress.stateProvince = faker.location.state({ abbreviated: true });
    locationAddress.postalCode = faker.location.zipCode("#####");
    locationAddress.country = "USA";
    locationAddress.companyId = faker.string.uuid(); // This should be set to actual company IDs in tests to work

    return locationAddress;
});
