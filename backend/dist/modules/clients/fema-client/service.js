import { DisasterTransaction } from "../../disaster/transaction";
import { CreateDisasterDTOSchema } from "../../../types/disaster";
import { fetch } from "bun";
const FEMA_API = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries";
export class FemaService {
    db;
    constructor(db) {
        this.db = db;
    }
    fetchFemaDisasters = async ({ lastRefreshDate }) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const response = await fetch(FEMA_API +
            `?$filter=declarationDate ge ${threeMonthsAgo.toISOString()} and lastRefresh gt ${lastRefreshDate.toISOString()}`);
        const { DisasterDeclarationsSummaries } = await response.json();
        const disasterTransaction = new DisasterTransaction(this.db);
        for (const disaster of DisasterDeclarationsSummaries) {
            const parsedDisaster = CreateDisasterDTOSchema.parse(disaster);
            await disasterTransaction.createDisaster(parsedDisaster);
        }
    };
    async preloadDisasters() {
        const threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() - 3);
        await this.fetchFemaDisasters({ lastRefreshDate: threeMonths });
    }
}
