import { DataSource } from "typeorm";
import { withServiceErrorHandling } from "../../../utilities/error";
import { DisasterTransaction } from "../../disaster/transaction";
import { FemaDisaster } from "../../../entities/FemaDisaster";
import { CreateDisasterDTOSchema } from "../../../types/disaster";

export interface IFemaService {
    //refreshFemaDisasters(): Promise<void>;
    fetchFemaDisasters({ lastRefreshDate }: { lastRefreshDate: Date }): Promise<any>;
}

export class FemaService implements IFemaService {

    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    fetchFemaDisasters = withServiceErrorHandling(async ({ lastRefreshDate }: { lastRefreshDate: Date }) => {
        const femaApi = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getDay() - 3);

        const response = await fetch(femaApi + `?$filter=declarationDate ge ${threeMonthsAgo.toISOString()} and lastRefresh gt ${lastRefreshDate.toISOString()}`);
        const { DisasterDeclarationsSummaries } = await response.json();

        const disasterTransaction = new DisasterTransaction(this.db);
        const disasterArray = [];
        for (const disaster of DisasterDeclarationsSummaries) {
            const femaId = disaster.id;
            const fipsStateCode = disaster.fipsStateCode;
            const parsedDisaster = CreateDisasterDTOSchema.parse({ ...disaster, femaId: femaId, state: fipsStateCode });
            const disasterEntity = await disasterTransaction.createDisaster(parsedDisaster) as FemaDisaster;
            disasterArray.push(disasterEntity);
        }

        return disasterArray;

    })
}

