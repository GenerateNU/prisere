import { setSeederFactory } from "typeorm-extension";
import { Invoice } from "../../entities/Invoice.js";

export default setSeederFactory(Invoice, (faker) => {
    const invoice = new Invoice();
    invoice.id = faker.string.uuid();
    invoice.companyId = faker.string.uuid(); // this needs to be set to actual company IDs in tests to work
    invoice.quickbooksId = faker.number.int({ min: 0 });
    invoice.totalAmountCents = faker.number.int({ min: 0 });
    invoice.dateCreated = faker.date.past();
    invoice.lastUpdated = faker.date.recent();

    return invoice;
});
