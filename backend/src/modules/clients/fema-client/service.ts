import { DataSource } from "typeorm";
import { withServiceErrorHandling } from "../../../utilities/error";
import { DisasterTransaction } from "../../disaster/transaction";
import { CreateDisasterDTOSchema } from "../../../types/disaster";

export interface IFemaService {
    fetchFemaDisasters({ lastRefreshDate } : { lastRefreshDate: Date }): Promise<void>;
}

export class FemaService implements IFemaService {

    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    fetchFemaDisasters= async ( { lastRefreshDate } : { lastRefreshDate: Date }) => {
        const femaApi = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
            const response = await fetch(femaApi + `?$filter=declarationDate ge ${threeMonthsAgo.toISOString()} and lastRefresh gt ${lastRefreshDate.toISOString()}`);
            const { DisasterDeclarationsSummaries } = await response.json();
            const disasterTransaction = new DisasterTransaction(this.db);
            const disasterArray = [];
            for (const disaster of DisasterDeclarationsSummaries) {
                const parsedDisaster = CreateDisasterDTOSchema.parse(disaster);
                const disasterEntity = await disasterTransaction.createDisaster(parsedDisaster);
            }

    };
}

