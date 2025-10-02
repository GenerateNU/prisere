import { CronJob } from "cron";
import { FemaService } from "../modules/clients/fema-client/service";

export interface CronJobHandler {
    initializeCron(): CronJob;
}

export class FemaFetching implements CronJobHandler {
    private femaService: FemaService;

    constructor(femaService: FemaService) {
        this.femaService = femaService;
    }

    initializeCron(): CronJob {
        const femaService = this.femaService;
        const lastRefreshDate = new Date();
        lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);
        return CronJob.from({
            cronTime: "0 2 * * *",
            onTick: async function () {
                await femaService.fetchFemaDisasters({ lastRefreshDate: lastRefreshDate });
            },
            start: true,
            timeZone: "America/New_York",
            runOnInit: true,
        });
    }
}
