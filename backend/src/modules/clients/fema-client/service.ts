import { DataSource } from "typeorm";
import { DisasterTransaction } from "../../disaster/transaction";
import { CreateDisasterDTOSchema } from "../../../types/disaster";
import { FemaFetching } from "../../../utilities/cron_job_handler";
import { fetch } from "bun";

const FEMA_API = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries";

export interface IFemaService {
    fetchFemaDisasters({ lastRefreshDate }: { lastRefreshDate: Date }): Promise<void>;
}

export class FemaService implements IFemaService {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    fetchFemaDisasters = async ({ lastRefreshDate }: { lastRefreshDate: Date }) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const response = await fetch(
            FEMA_API +
                `?$filter=declarationDate ge ${threeMonthsAgo.toISOString()} and lastRefresh gt ${lastRefreshDate.toISOString()}`
        );
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
