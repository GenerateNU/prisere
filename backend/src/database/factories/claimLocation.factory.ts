import { setSeederFactory } from "typeorm-extension";
import { ClaimLocation } from "../../entities/ClaimLocation.js";

export default setSeederFactory(ClaimLocation, (faker) => {
    const claimLocation = new ClaimLocation();
    claimLocation.id = faker.string.uuid();
    claimLocation.claimId = faker.string.uuid(); // This should be set to actual claim IDs in tests to work
    claimLocation.locationAddressId = faker.string.uuid(); // This should be set to actual location address IDs in tests to work

    return claimLocation;
});
