import { setSeederFactory } from "typeorm-extension";
import { Company } from "../../entities/Company.js";

export default setSeederFactory(Company, (faker) => {
    const company = new Company();
    company.id = faker.string.uuid();
    company.name = faker.company.name();
    company.lastQuickBooksInvoiceImportTime = faker.date.past();
    company.lastQuickBooksPurchaseImportTime = faker.date.past();

    return company;
});
