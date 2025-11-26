import { CronJob } from "cron";
import { CronJobHandler } from "./cron_job_handler";
import { DataSource } from "typeorm";
import { IFemaRiskIndexService } from "../../modules/fema-risk-index-data/service";

export class FemaRiskFetchingCron implements CronJobHandler {
    private femaService: IFemaRiskIndexService;
    private db: DataSource;

    constructor(femaService: IFemaRiskIndexService, db: DataSource) {
        this.femaService = femaService;
        this.db = db;
    }

    initializeCron(): CronJob {
        return CronJob.from({
            //Mondays @ 3:30 AM
            cronTime: "30 3 * * 0",
            onTick: async () => {
                await this.femaService.updateFemaRiskIndexData();
            },
            start: true,
            timeZone: "America/New_York",
            runOnInit: true,
        });
    }
}
