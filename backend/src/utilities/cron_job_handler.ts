import { CronJob } from "cron";
import { IFemaService } from "../modules/clients/fema-client/service";

export interface CronJobHandler {
    initializeCron(): CronJob;
}

export class FemaFetching implements CronJobHandler {
    private femaService: IFemaService;

    constructor(femaService: IFemaService) {
        this.femaService = femaService;
    }

    initializeCron(): CronJob {
        const lastRefreshDate = new Date();
        lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);
        return CronJob.from({
            cronTime: "0 2 * * *",
            onTick: async () => {
                await this.femaService.fetchFemaDisasters({ lastRefreshDate: lastRefreshDate });
            },
            start: true,
            timeZone: "America/New_York",
            runOnInit: true,
        });
    }
}
