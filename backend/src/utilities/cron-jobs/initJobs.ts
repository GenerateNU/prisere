import { DataSource } from "typeorm";
import { FemaService, IFemaService } from "../../modules/clients/fema-client/service";
import { FemaDisasterFetching } from "./FemaDisasterDataCron";
import { FemaRiskFetchingCron } from "./FemaRiskDataCron";
import { FemaRiskIndexService, IFemaRiskIndexService } from "../../modules/fema-risk-index-data/service";
import { FemaRiskTransaction, IFemaRiskIndexTransaction } from "../../modules/fema-risk-index-data/transaction";

export const initCronJobs = async (db: DataSource) => {
    const femaService: IFemaService = new FemaService(db);
    await femaService.preloadDisasters();
    const femaDisastersCron = new FemaDisasterFetching(femaService, db);
    femaDisastersCron.initializeCron();
    const femaRiskIndexTransaction: IFemaRiskIndexTransaction = new FemaRiskTransaction(db);
    const femaRiskIndexService: IFemaRiskIndexService = new FemaRiskIndexService(femaRiskIndexTransaction);
    const femaRiskIndexCron = new FemaRiskFetchingCron(femaRiskIndexService, db);
    femaRiskIndexCron.initializeCron();
};
