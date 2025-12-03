import { setSeederFactory } from "typeorm-extension";
import { Claim } from "../../entities/Claim";
import { ClaimStatusType } from "../../types/ClaimStatusType";

export default setSeederFactory(Claim, (faker) => {
    const claim = new Claim();
    claim.id = faker.string.uuid();
    claim.name = faker.string.sample(10);
    claim.companyId = faker.string.uuid(); // This should be set to actual company IDs in tests to work
    claim.status = faker.helpers.enumValue(ClaimStatusType);
    claim.createdAt = faker.date.past();
    claim.updatedAt = faker.datatype.boolean() ? faker.date.recent() : undefined;

    return claim;
});
