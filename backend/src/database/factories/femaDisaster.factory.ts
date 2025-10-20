import { setSeederFactory } from "typeorm-extension";
import { FemaDisaster } from "../../entities/FemaDisaster";

export default setSeederFactory(FemaDisaster, (faker) => {
    const femaDisaster = new FemaDisaster();
    femaDisaster.id = faker.string.uuid();
    femaDisaster.disasterNumber = faker.number.int({ min: 1000, max: 9999 });
    femaDisaster.fipsStateCode = faker.number.int({ min: 0, max: 56 });
    femaDisaster.declarationDate = faker.date.past();
    femaDisaster.incidentBeginDate = faker.datatype.boolean() ? faker.date.past() : null;
    femaDisaster.incidentEndDate = faker.datatype.boolean() ? faker.date.recent() : null;
    femaDisaster.fipsCountyCode = faker.number.int({ min: 0, max: 1000 });
    femaDisaster.declarationType = faker.string.alpha({ length: 2 }).toUpperCase();
    femaDisaster.designatedArea = `${faker.location.county()} County`;
    femaDisaster.designatedIncidentTypes = faker.helpers
        .arrayElements(["Flood", "Hurricane", "Tornado", "Earthquake", "Wildfire", "Winter Storm"], { min: 1, max: 3 })
        .join(", ");
    return femaDisaster;
});
